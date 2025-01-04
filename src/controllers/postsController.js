const getAllPosts = (req, res) => {
console.log('posts')
res.send('getAllPosts');
}

const getPostBySender = (req, res) => {
  res.send('getPostBySender');
  }

const getPostById = (req, res) => {
  res.send('getPostById');
  }

const deletePostById = (req, res) => {
  res.send('deletePostById');
  }

const createPost = (req, res) => {
  res.send('createPost');
  }

  module.exports = {
    getAllPosts,
    getPostBySender,
    getPostById,
    deletePostById,
    createPost
  }