import commentModel, { IComments } from "../models/commentModel";
import { Request, Response } from "express";
import BaseController from "./baseController";
import postModel from "../models/postsModel";

class CommentsController extends BaseController<IComments> {
  constructor() {
    super(commentModel);
  }

  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const postId = req.body.postId;

    const postDB = await postModel.findById(postId);

    if (!postDB) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment: IComments = {
      ...req.body,
      sender: userId,
    };
    req.body = comment;
    super.create(req, res);
  }
}
export default new CommentsController();
