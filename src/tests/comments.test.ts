import request from "supertest";
import mongoose, { Types } from "mongoose";
import commentsModel from "../models/commentModel";
import { Express } from "express";
import testComments from "./testComments.json";
import initBlogApiApp from "../server";
import userModel, { IUser } from "../models/userModel";
import postModel from "../models/postsModel";

var app: Express;

type testComment = {
  comment: string;
  postId: string;
}

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@example.com",
  password: "password123",
}

const newPost = {
  title: "Test post title",
  content: "Test post content",
}

let mappedTestComments: testComment[];
beforeAll(async () => {
  app = await initBlogApiApp();
  await commentsModel.deleteMany();
  await postModel.deleteMany();

  await userModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  testUser.token = res.body.accessToken;
  testUser._id = res.body._id;
  expect(testUser.token).toBeDefined();

  const postResponse = await request(app).post("/posts")
  .set({ authorization: "JWT " + testUser.token })
  .send(newPost);
  expect(postResponse.statusCode).toBe(201);
  expect(postResponse.body._id).toBeDefined();
  const postId = postResponse.body._id;

  mappedTestComments = testComments.map((testComment) => ({
    comment: testComment.comment,
    postId: postId,
  }));
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

describe("Comments Tests", () => {
  test("Empty comments test get all", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test create comment", async () => {
    const response = await request(app).post("/comments")
    .set({ authorization: "JWT " + testUser.token })
    .send(mappedTestComments[0])
    expect(response.statusCode).toBe(201);
    expect(response.body.comment).toBe(mappedTestComments[0].comment);
    expect(response.body.postId).toBe(mappedTestComments[0].postId);
  });

  test("Test get comment by sender", async () => {
    const getResponse = await request(app).get("/comments?sender=" + testUser._id);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.length).toBe(1);
    expect(getResponse.body[0].comment).toBe(mappedTestComments[0].comment);
    expect(getResponse.body[0].postId).toBe(mappedTestComments[0].postId);
  });

  test("Test get comment by id", async () => {
    const postResponse = await request(app).post("/comments")
    .set({ authorization: "JWT " + testUser.token })
    .send(mappedTestComments[1]);
    expect(postResponse.statusCode).toBe(201);
    expect(postResponse.body.comment).toBe(mappedTestComments[1].comment);
    expect(postResponse.body.postId).toBe(mappedTestComments[1].postId);
    expect(postResponse.body._id).toBeDefined();
    const commentId = postResponse.body._id;

    const response = await request(app).get("/comments/" + commentId);
    expect(response.statusCode).toBe(200);
    expect(response.body.comment).toBe(mappedTestComments[1].comment);
    expect(response.body.postId).toBe(mappedTestComments[1].postId);
  });

  test("Test get comment get all 2", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test delete comment", async () => {
    const postResponse = await request(app).post("/comments")
    .set({ authorization: "JWT " + testUser.token })
    .send(mappedTestComments[2]);
    expect(postResponse.statusCode).toBe(201);
    expect(postResponse.body._id).toBeDefined();
    const commentId = postResponse.body._id;
    const getResponse = await request(app).get("/comments/" + commentId);
    expect(getResponse.statusCode).toBe(200);

    const deleteResponse = await request(app).delete("/comments/" + commentId)
    .set({ authorization: "JWT " + testUser.token });
    expect(deleteResponse.statusCode).toBe(200);
    const getDeleteResponse = await request(app).get("/comments/" + commentId);
    expect(getDeleteResponse.statusCode).toBe(404);
  });

  test("Test Create Post fail with fake postId", async () => {
    const response = await request(app).post("/comments")
    .set({ authorization: "JWT " + testUser.token })
    .send({ comment: "Test comment", postId: new Types.ObjectId()});
    expect(response.statusCode).toBe(400);
  });

});