const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT

  app.listen(port, () => {
    console.log(`app listening at port ${port}`);
  });


app.get('/', (req, res) => {
  res.send('check');
});


