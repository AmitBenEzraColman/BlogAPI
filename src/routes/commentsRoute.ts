import express from "express";
import commentsController from "../controllers/commentsController";

const router = express.Router();

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
  commentsController.deleteById(req, res);
});

export default router;
