import request from "supertest";
import { beforeAll, afterAll, describe, test, expect } from '@jest/globals';
import initBlogApiApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/postsModel";
import { Express } from "express";
import userModel, { IUser } from "../models/userModel";
import testPosts from "./testPosts.json";

var app: Express;

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@example.com",
  password: "password123",
}

beforeAll(async () => {
  app = await initBlogApiApp();
  await postModel.deleteMany();

  await userModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  testUser.token = res.body.accessToken;
  testUser._id = res.body._id;
  expect(testUser.token).toBeDefined();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

describe("Posts Tests", () => {
  test("Empty Posts test get all", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test create Post", async () => {
    const response = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send(testPosts[0]);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(testPosts[0].title);
    expect(response.body.content).toBe(testPosts[0].content);
  });

  test("Test get post by sender", async () => {
    const response = await request(app).get("/posts?sender=" + testUser._id);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe(testPosts[0].title);
    expect(response.body[0].content).toBe(testPosts[0].content);
  });

  test("Test get post by id", async () => {
    const postResponse = await request(app).post("/posts")
    .set({ authorization: "JWT " + testUser.token })
    .send(testPosts[1]);
    expect(postResponse.statusCode).toBe(201);
    expect(postResponse.body.title).toBe(testPosts[1].title);
    expect(postResponse.body.content).toBe(testPosts[1].content);
    expect(postResponse.body._id).toBeDefined();
    const postId = postResponse.body._id;

    const getResponse = await request(app).get("/posts/" + postId);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.title).toBe(testPosts[1].title);
    expect(getResponse.body.content).toBe(testPosts[1].content);
  });


  test("Test get posts get all 2", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test delete post", async () => {
    const postResponse = await request(app).post("/posts")
    .set({ authorization: "JWT " + testUser.token })
    .send(testPosts[2]);
    expect(postResponse.statusCode).toBe(201);
    expect(postResponse.body._id).toBeDefined();
    const postId = postResponse.body._id;
    const getResponse = await request(app).get("/posts/" + postId);
    expect(getResponse.statusCode).toBe(200);

    const deleteresponse = await request(app).delete("/posts/" + postId)
      .set({ authorization: "JWT " + testUser.token });
    expect(deleteresponse.statusCode).toBe(200);
    const getDeleteResponse = await request(app).get("/posts/" + postId);
    expect(getDeleteResponse.statusCode).toBe(404);
  });

  test("Test create post fail without only content", async () => {
    const response = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        content: "Test content without sender",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Test create post fail without title", async () => {
    const response = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        content: "Test content without title",
        sender: testUser._id,
      });
    expect(response.statusCode).toBe(400);
  });
});