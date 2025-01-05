const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
});

const commentModel = mongoose.model("Comments", commentSchema);
module.exports = commentModel;
