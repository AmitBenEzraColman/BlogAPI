import dotenv from "dotenv";

import mongoose from "mongoose";
import bodyParser from "body-parser";
import express, { Express } from "express";
import postsRoute from "./routes/postsRoute";
import commentsRoute from "./routes/commentsRoute";

dotenv.config();

const blogApiApp = express();
blogApiApp.use(bodyParser.json());
blogApiApp.use(bodyParser.urlencoded({ extended: true }));

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

//App Routers
blogApiApp.use("/posts", postsRoute);
blogApiApp.use("/comments", commentsRoute);

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
