const commentsModel = require("../models/commentModel");
const BaseController = require("./baseController");

const commentsController = new BaseController(commentsModel);

module.exports = commentsController;
