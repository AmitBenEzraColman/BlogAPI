import express from "express";
import commentsController from "../controllers/commentsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", (req, res) => {
  commentsController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  commentsController.getById(req, res);
});

router.post("/", authMiddleware, (req, res) => {
  commentsController.create(req, res);
});

router.delete("/:id", authMiddleware, (req, res) => {
  commentsController.deleteById(req, res);
});

export default router;
