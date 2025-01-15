import initBlogApiApp from "../server";
import mongoose from "mongoose";

describe("Server tests", () => {
  test("Fails to initialize app without DB_CONNECTION", async () => {
    const originalEnv = process.env.DB_CONNECTION;
    process.env.DB_CONNECTION = "";

    await expect(initBlogApiApp()).rejects.toEqual(
      "Cannot find env call 'DB_CONNECTION'"
    );

    process.env.DB_CONNECTION = originalEnv;
  });

  test("Initializes app successfully with valid DB_CONNECTION", async () => {
    const originalEnv = process.env.DB_CONNECTION;
    process.env.DB_CONNECTION = "mongodb://localhost:27017/test";

    await mongoose.connection.close();
    const app = await initBlogApiApp();
    expect(app).toBeDefined();

    process.env.DB_CONNECTION = originalEnv;
  });
});
