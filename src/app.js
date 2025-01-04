const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT

const postRoutes = require("./routes/postsRoute")
app.use("/post", postRoutes)

app.get('/', (req, res) => {
  res.send('check');
});


app.listen(port, () => {
  console.log(`app listening at port ${port}`);
});