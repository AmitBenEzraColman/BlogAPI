import commentModel, { IComments } from "../models/commentModel";
import { Request, Response } from "express";
import BaseController from "./baseController";

class CommentsController extends BaseController<IComments> {
  constructor() {
    super(commentModel);
  }
}
export default new CommentsController();
