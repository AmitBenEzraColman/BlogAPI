const postModel = require("../models/postsModel")

const getAllPosts = (req, res) => {
  const sender = req.query.sender;
  res.send('getPostBySender: ' + sender);
  }

const getPostById = (req, res) => {
  res.send('getPostById: '+ req.params.id);
  }

const deletePostById = (req, res) => {
  res.send('deletePostById: '+ req.params.id);
  }

const createPost = (req, res) => {
  const post = req.body;
  postModel.create(post, (error, post) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.send(post);
    }
  });
  res.send('createPost: ' + JSON.stringify(post));
  }

  module.exports = {
    getAllPosts,
    getPostById,
    deletePostById,
    createPost
  }