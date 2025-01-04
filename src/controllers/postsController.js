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

const createPost = async (req, res) => {
  const post = req.body;
  try {
   const newPost = await postModel.create(post)
   res.status(201).send(newPost);
  } 
  catch(error){
    res.status(400).send(error);
  }
  
  }

  module.exports = {
    getAllPosts,
    getPostById,
    deletePostById,
    createPost
  }