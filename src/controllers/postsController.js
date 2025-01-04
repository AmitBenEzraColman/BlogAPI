const postModel = require("../models/postsModel")

const getAllPosts = async (req, res) => {
  const sender = req.query.sender;
  try {
    let posts;
    if(sender){
      posts = await postModel.find({sender: sender});
    } else {
      posts = await postModel.find();
    }
    res.status(201).send(posts);
   } 
   catch(error){
     res.status(400).send(error);
   }
  }

const getPostById = async (req, res) => {
  const postId = req.params.id;
  console.log('postId',postId)
  try {
    const posts = await postModel.findById(postId);
    console.log('posts:' + posts)
    res.status(201).send(posts);
   } 
   catch(error){
     res.status(400).send(error);
   }
  }

const deletePostById = async (req, res) => {
    const id = req.params.id;
  
  try {
    const posts = await postModel.findByIdAndDelete(id)
    res.status(201).send(posts);
   } 
   catch(error){
     res.status(400).send(error);
   }
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