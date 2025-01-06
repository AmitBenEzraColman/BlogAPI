import mongoose from "mongoose";

export interface IComments {
  comment: string;
  sender: string;
  postId: mongoose.Schema.Types.ObjectId;
}

const Schema = mongoose.Schema;

const commentSchema = new Schema<IComments>({
  comment: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },
});

const commentModel = mongoose.model<IComments>("Comments", commentSchema);

export default commentModel;
