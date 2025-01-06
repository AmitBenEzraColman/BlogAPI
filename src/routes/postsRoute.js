const express = require("express");
const router = express.Router();
const postController = require("../controllers/postsController");

router.get("/", (req, res) => {
  postController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  postController.getById(req, res);
});

router.post("/", (req, res) => {
  postController.create(req, res);
});

router.delete("/:id", (req, res) => {
  postController.delete(req, res);
});

module.exports = router;
