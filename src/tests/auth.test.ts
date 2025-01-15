import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/postsModel";
import { Express } from "express";
import userModel, { IUser } from "../models/userModel";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();
  await postModel.deleteMany();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
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

describe("Auth tests", () => {
  test("Test Register", async () => {
    const response = await request(app).post("/auth/register").send(testUser);
    expect(response.statusCode).toBe(200);
  });

  test("Test Register exist email", async () => {
    const response = await request(app).post("/auth/register").send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test("Test Register missing password", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "john@student.com",
    });
    expect(response.statusCode).toBe(400);
  });

  test("Test Register missing email", async () => {
    const response = await request(app).post("/auth/register").send({
      password: "1234567890",
    });
    expect(response.statusCode).toBe(400);
  });

  test("Auth test login", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(response.body._id).toBeDefined();
    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    testUser._id = response.body._id;
  });

  test("Check tokens are not the same", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;

    expect(accessToken).not.toBe(testUser.accessToken);
    expect(refreshToken).not.toBe(testUser.refreshToken);
  });

  test("Test access with valid token", async () => {
    const responseLogin = await request(app).post("/auth/login").send(testUser);
    expect(responseLogin.statusCode).toBe(200);
    testUser.accessToken = responseLogin.body.accessToken;
    testUser.refreshToken = responseLogin.body.refreshToken;

    const responsePost = await request(app)
      .post("/posts")
      .set({ authorization: "Bearer " + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
      });
    expect(responsePost.statusCode).toBe(201);
  });

  test("Test access with invalid token", async () => {
    const responseLogin = await request(app).post("/auth/login").send(testUser);
    expect(responseLogin.statusCode).toBe(200);
    testUser.accessToken = responseLogin.body.accessToken;
    testUser.refreshToken = responseLogin.body.refreshToken;

    const responsePost = await request(app)
      .post("/posts")
      .set({ authorization: "Bearer " + +"1" + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
      });
    expect(responsePost.statusCode).not.toBe(200);
  });

  jest.setTimeout(20000);
  test("Test timeout token ", async () => {
    const responseLogin = await request(app).post("/auth/login").send(testUser);
    expect(responseLogin.statusCode).toBe(200);

    testUser.accessToken = responseLogin.body.accessToken;
    testUser.refreshToken = responseLogin.body.refreshToken;

    await new Promise((resolve) => setTimeout(resolve, 6000));

    const responsePost1 = await request(app)
      .post("/posts")
      .set({ authorization: "Bearer " + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
      });
    expect(responsePost1.statusCode).not.toBe(201);

    const responseRefresh = await request(app).post("/auth/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(responseRefresh.statusCode).toBe(200);
    testUser.accessToken = responseRefresh.body.accessToken;

    const responsePost2 = await request(app)
      .post("/posts")
      .set({ authorization: "Bearer " + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
      });
    expect(responsePost2.statusCode).toBe(201);
  });

  test("User isn't authenticated and request refresh token", async () => {
    const response = await request(app).get("/auth/refresh").send();
    expect(response.statusCode).not.toBe(200);
  });

  test("Test refresh token", async () => {
    const response = await request(app).post("/auth/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });

  test("Test logout", async () => {
    const responseLogin = await request(app).post("/auth/login").send(testUser);
    expect(responseLogin.statusCode).toBe(200);
    testUser.accessToken = responseLogin.body.accessToken;
    testUser.refreshToken = responseLogin.body.refreshToken;

    const responselogout = await request(app).post("/auth/logout").send({
      refreshToken: testUser.refreshToken,
    });
    expect(responselogout.statusCode).toBe(200);

    const responseRefresh = await request(app).post("/auth/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(responseRefresh.statusCode).not.toBe(200);
  });
});
