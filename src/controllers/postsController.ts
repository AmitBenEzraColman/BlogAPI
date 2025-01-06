import postModel, { IPost } from "../models/postsModel";
import BaseController from "./baseController";

class PostsController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  //Here we can add more functions
}

export default new PostsController();
