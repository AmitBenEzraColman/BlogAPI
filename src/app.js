const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require("mongoose");
mongoose.connect(process.env.DB_CONNECTION);
const db = mongoose.connection;
db.on("error", (error) => console.log("error", error));
db.once("open", () => console.log("connected to DB"));

const postRoutes = require("./routes/postsRoute");
app.use("/posts", postRoutes);

const commentsRoutes = require("./routes/commentsRoute");
app.use("/comments", commentsRoutes);

app.get("/", (req, res) => {
  res.send("check");
});

app.listen(port, () => {
  console.log(`app listening at port ${port}`);
});
