const express = require('express');
const router = express.Router();
const postController = require("../controllers/postsController")

router.get('/', (req, res) => {
  postController.getAllPosts(req, res)
});

router.get('/:id', (req, res) => {
  postController.getPostById(req, res)
});

router.get('/:id', (req, res) => {
  postController.getPostBySender(req, res)
});

router.post('/', (req, res) => {
  postController.createPost(req, res)
});

router.delete('/', (req, res) => {
  postController.deletePostById(req, res)
});

module.exports = router;
