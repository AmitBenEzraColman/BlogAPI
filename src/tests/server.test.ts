import initBlogApiApp from "../server";
import mongoose from "mongoose";
import express, { Express } from "express";

describe("Server tests", () => {
  test("Test without DB_CONNECTION fail", async () => {
    const originalEnv = process.env.DB_CONNECTION;
    process.env.DB_CONNECTION = "";

    await expect(initBlogApiApp()).rejects.toEqual(
      "Cannot find env call 'DB_CONNECTION'"
    );

    process.env.DB_CONNECTION = originalEnv;
  });

  test("Test Initializes app successfully with valid DB_CONNECTION", async () => {
    const originalEnv = process.env.DB_CONNECTION;
    process.env.DB_CONNECTION = "mongodb://localhost:27017/test";

    await mongoose.connection.close();
    const app = await initBlogApiApp();
    expect(app).toBeDefined();

    process.env.DB_CONNECTION = originalEnv;
  });

  test("Test reject when mongoose connect fails", async () => {
    const originalEnv = process.env.DB_CONNECTION;
    process.env.DB_CONNECTION = "mongodb://invalid-host:27017/test";

    // Mocking the mongoose.connect to reject with an error
    mongoose.connect = jest.fn().mockRejectedValue(new Error("MongoDB connection failed"));

    await expect(initBlogApiApp()).rejects.toThrow("MongoDB connection failed");

    process.env.DB_CONNECTION = originalEnv;
  });

});
