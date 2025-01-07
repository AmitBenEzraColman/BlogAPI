import postModel, { IPost } from "../models/postsModel";
import BaseController from "./baseController";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }
}

export default new PostsController();
