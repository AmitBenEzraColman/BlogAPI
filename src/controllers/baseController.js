const { Model } = require("mongoose");

class BaseController {
  constructor(model) {
    this.model = model;
  }
  async getAll(req, res) {
    const filter = req.query.owner;
    try {
      if (filter) {
        const item = await this.model.find({ sender: filter });
        res.send(item);
      } else {
        const items = await this.model.find();
        res.send(items);
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async getById(req, res) {
    const id = req.params.id;

    try {
      const item = await this.model.findById(id);
      if (item != null) {
        res.send(item);
      } else {
        res.status(404).send("not found");
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async create(req, res) {
    const body = req.body;
    try {
      const item = await this.model.create(body);
      res.status(201).send(item);
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async deleteItem(req, res) {
    const id = req.params.id;
    try {
      const rs = await this.model.findByIdAndDelete(id);
      res.status(200).send("deleted");
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

module.exports = BaseController;
