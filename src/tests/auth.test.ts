import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/postsModel";
import { Express } from "express";
import userModel, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany();
  await postModel.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

const baseUrl = "/auth";

type User = IUser & {
  accessToken?: string;
  refreshToken?: string;
};

const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
};

describe("Auth Tests", () => {
  describe("Register Tests", () => {
    beforeEach(async () => {
      await userModel.deleteMany();
      // Clear environment variables before each test
      delete process.env.TOKEN_SECRET;
    });

    test("Test successful registration", async () => {
      const response = await request(app).post("/auth/register").send(testUser);
      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.password).not.toBe(testUser.password); // Should be hashed

      // Verify password was properly hashed
      const savedUser = await userModel.findOne({ email: testUser.email });
      const validPassword = await bcrypt.compare(
        testUser.password,
        savedUser!.password
      );
      expect(validPassword).toBe(true);
    });

    test("Test register with existing email", async () => {
      await request(app).post("/auth/register").send(testUser);

      const response = await request(app).post("/auth/register").send(testUser);
      expect(response.statusCode).toBe(400);
    });

    test("Test register with missing password", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "john@test.com" });
      expect(response.statusCode).toBe(400);
    });

    test("Test register with missing email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ password: "1234567890" });
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Login Tests", () => {
    beforeEach(async () => {
      await userModel.deleteMany();
      await request(app).post("/auth/register").send(testUser);

      process.env.TOKEN_SECRET = "test-secret";
    });

    test("Test login when TOKEN_SECRET is missing", async () => {
      delete process.env.TOKEN_SECRET;

      const response = await request(app)
        .post(baseUrl + "/login")
        .send(testUser);
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("internal server error");
    });

    test("Test login with database error", async () => {
      jest
        .spyOn(userModel, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await request(app)
        .post(baseUrl + "/login")
        .send(testUser);
      expect(response.statusCode).toBe(400);
    });

    test("Test successful login", async () => {
      const response = await request(app)
        .post(baseUrl + "/login")
        .send(testUser);
      expect(response.statusCode).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body._id).toBeDefined();
    });

    test("Test login with incorrect password", async () => {
      const response = await request(app)
        .post(baseUrl + "/login")
        .send({ ...testUser, password: "wrongpassword" });
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("email or password incorrect");
    });

    test("Test login with non-existent email", async () => {
      const response = await request(app)
        .post(baseUrl + "/login")
        .send({ email: "nonexistent@test.com", password: "password123" });
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("email or password incorrect");
    });

    test("Test login with missing email", async () => {
      const response = await request(app)
        .post(baseUrl + "/login")
        .send({ password: testUser.password });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("missing email or password");
    });

    test("Test login with missing password", async () => {
      const response = await request(app)
        .post(baseUrl + "/login")
        .send({ email: testUser.email });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("missing email or password");
    });
  });

  describe("Token and Authentication Tests", () => {
    beforeEach(async () => {
      await userModel.deleteMany();
      await request(app).post("/auth/register").send(testUser);
      const loginResponse = await request(app)
        .post("/auth/login")
        .send(testUser);
      testUser.accessToken = loginResponse.body.accessToken;
      testUser.refreshToken = loginResponse.body.refreshToken;
    });

    test("Test accessing protected route with valid token", async () => {
      const response = await request(app)
        .post("/posts")
        .set({ authorization: `Bearer ${testUser.accessToken}` })
        .send({
          title: "Test Post",
          content: "Test Content",
        });
      expect(response.statusCode).toBe(201);
    });

    test("Test accessing protected route with invalid token", async () => {
      const response = await request(app)
        .post("/posts")
        .set({ authorization: "Bearer invalid_token" })
        .send({
          title: "Test Post",
          content: "Test Content",
        });
      expect(response.statusCode).toBe(401);
    });

    jest.setTimeout(20000);
    test("Test token expiration and refresh flow", async () => {
      await new Promise((resolve) => setTimeout(resolve, 6000));

      const expiredResponse = await request(app)
        .post("/posts")
        .set({ authorization: `Bearer ${testUser.accessToken}` })
        .send({
          title: "Test Post",
          content: "Test Content",
        });
      expect(expiredResponse.statusCode).toBe(401);

      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: testUser.refreshToken });
      expect(refreshResponse.statusCode).toBe(200);

      const newResponse = await request(app)
        .post("/posts")
        .set({ authorization: `Bearer ${refreshResponse.body.accessToken}` })
        .send({
          title: "Test Post",
          content: "Test Content",
        });
      expect(newResponse.statusCode).toBe(201);
    });
  });

  describe("Refresh Token Tests", () => {
    beforeEach(async () => {
      await userModel.deleteMany();
      process.env.TOKEN_SECRET = "test-secret";
      await request(app).post("/auth/register").send(testUser);
      const loginResponse = await request(app)
        .post("/auth/login")
        .send(testUser);
      testUser.refreshToken = loginResponse.body.refreshToken;
    });

    test("Test refresh token when TOKEN_SECRET is missing", async () => {
      delete process.env.TOKEN_SECRET;

      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: testUser.refreshToken });
      expect(response.statusCode).toBe(400);
    });

    test("Test refresh with database error during user lookup", async () => {
      const validToken = jwt.sign(
        {
          _id: new mongoose.Types.ObjectId(),
          random: Math.random().toString(),
        },
        "test-secret"
      );
      jest
        .spyOn(userModel, "findById")
        .mockRejectedValueOnce(new Error("Database error"));

      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: validToken });
      expect(response.statusCode).toBe(400);
    });

    test("Test refresh with jwt verification error", async () => {
      jest
        .spyOn(jwt, "verify")
        .mockImplementationOnce((token, secret, callback: any) => {
          callback(new Error("JWT Error"), null);
        });

      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: testUser.refreshToken });
      expect(response.statusCode).toBe(400);
    });

    test("Test refresh with database error during save", async () => {
      const loginResponse = await request(app)
        .post("/auth/login")
        .send(testUser);

      jest
        .spyOn(mongoose.Model.prototype, "save")
        .mockRejectedValueOnce(new Error("Save error"));

      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: loginResponse.body.refreshToken });
      expect(response.statusCode).toBe(400);
    });

    test("Test successful refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: testUser.refreshToken });
      expect(response.statusCode).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body._id).toBeDefined();
    });

    test("Test refresh with invalid token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: "invalid_token" });
      expect(response.statusCode).toBe(400);
    });

    test("Test refresh without token", async () => {
      const response = await request(app).post("/auth/refresh").send({});
      expect(response.statusCode).toBe(400);
    });

    test("Test refresh with valid token format but non-existent user", async () => {
      const fakeToken = jwt.sign(
        {
          _id: new mongoose.Types.ObjectId(),
          random: Math.random().toString(),
        },
        process.env.TOKEN_SECRET!
      );
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: fakeToken });
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Logout Tests", () => {
    beforeEach(async () => {
      await userModel.deleteMany();
      process.env.TOKEN_SECRET = "test-secret";
      await request(app).post("/auth/register").send(testUser);
      const loginResponse = await request(app)
        .post("/auth/login")
        .send(testUser);
      testUser.refreshToken = loginResponse.body.refreshToken;
    });

    test("Test logout when TOKEN_SECRET is missing", async () => {
      delete process.env.TOKEN_SECRET;

      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: testUser.refreshToken });
      expect(response.statusCode).toBe(400);
    });

    test("Test logout with database error during save", async () => {
      jest
        .spyOn(mongoose.Model.prototype, "save")
        .mockRejectedValueOnce(new Error("Save error"));

      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: testUser.refreshToken });
      expect(response.statusCode).toBe(400);
    });

    test("Test logout with jwt verification error", async () => {
      jest
        .spyOn(jwt, "verify")
        .mockImplementationOnce((token, secret, callback: any) => {
          callback(new Error("JWT Error"), null);
        });

      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: testUser.refreshToken });
      expect(response.statusCode).toBe(400);
    });

    test("Test successful logout", async () => {
      const logoutResponse = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: testUser.refreshToken });
      expect(logoutResponse.statusCode).toBe(200);

      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: testUser.refreshToken });
      expect(refreshResponse.statusCode).toBe(400);
    });

    test("Test logout with invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: "invalid_token" });
      expect(response.statusCode).toBe(400);
    });

    test("Test logout without refresh token", async () => {
      const response = await request(app).post("/auth/logout").send({});
      expect(response.statusCode).toBe(400);
    });
  });
});
