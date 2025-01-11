import postModel, { IPost } from "../models/postsModel";
import BaseController from "./baseController";
import { Request, Response } from "express";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const post: IPost = {
      ...req.body,
      sender: userId,
    };
    req.body = post;
    super.create(req, res);
  }
}

export default new PostsController();
