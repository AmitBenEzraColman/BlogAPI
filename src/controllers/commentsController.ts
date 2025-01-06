import commentModel, { IComments } from "../models/commentModel";
import { Request, Response } from "express";
import BaseController from "./baseController";

class CommentsController extends BaseController<IComments> {
  constructor() {
    super(commentModel);
  }

  //Here we can add more functions
}
export default new CommentsController();
