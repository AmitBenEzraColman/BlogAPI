const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  getAllPosts(req, res)
});

module.exports = router;
