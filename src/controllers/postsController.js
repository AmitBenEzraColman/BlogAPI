const postModel = require("../models/postsModel");
const BaseController = require("./baseController");

const postsController = new BaseController(postModel);

module.exports = postsController;
