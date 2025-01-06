import express from "express";
import postsController from "../controllers/postsController";

const router = express.Router();

router.get("/", (req, res) => {
  postsController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  postsController.getById(req, res);
});

router.post("/", (req, res) => {
  postsController.create(req, res);
});

router.delete("/:id", (req, res) => {
  postsController.deleteById(req, res);
});

export default router;
