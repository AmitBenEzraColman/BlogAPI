const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");

router.get("/", (req, res) => {
  commentsController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  commentsController.getById(req, res);
});

router.post("/", (req, res) => {
  commentsController.create(req, res);
});

router.delete("/:id", (req, res) => {
  commentsController.delete(req, res);
});

module.exports = router;
