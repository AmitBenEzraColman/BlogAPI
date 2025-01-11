import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import express, { Express } from "express";
import postsRoute from "./routes/postsRoute";
import commentsRoute from "./routes/commentsRoute";
import authRouter from "./routes/authRoute";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

dotenv.config();

const blogApiApp = express();
blogApiApp.use(bodyParser.json());
blogApiApp.use(bodyParser.urlencoded({ extended: true }));

//App Routers
blogApiApp.use("/posts", postsRoute);
blogApiApp.use("/comments", commentsRoute);
blogApiApp.use("/auth", authRouter);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [{ url: "http://localhost:3000", },],
  },
  apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
blogApiApp.use("/api", swaggerUI.serve, swaggerUI.setup(specs));

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const initBlogApiApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (!process.env.DB_CONNECTION) {
      reject("Cannot find env call 'DB_CONNECTION'");
    } else {
      mongoose
        .connect(process.env.DB_CONNECTION)
        .then(() => {
          resolve(blogApiApp);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

export default initBlogApiApp;
