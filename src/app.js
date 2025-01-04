const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT

const mongoose = require("mongoose");
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true
})
const db = mongoose.connection;
db.on("error", (error) => console.log("error", error))
db.once("open", () => console.log("connect"))


const postRoutes = require("./routes/postsRoute")
app.use("/post", postRoutes)

app.get('/', (req, res) => {
  res.send('check');
});


app.listen(port, () => {
  console.log(`app listening at port ${port}`);
});