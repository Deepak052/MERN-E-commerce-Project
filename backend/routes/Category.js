const express = require("express");
const categoryController = require("../controllers/Category");
const router = express.Router();

router
  .post("/", categoryController.create)
  .get("/", categoryController.getAll)
  .get("/roots", categoryController.getRoots) // NEW: only root categories
  .get("/:id", categoryController.getById)
  .patch("/:id", categoryController.updateById)
  .delete("/:id", categoryController.deleteById);

module.exports = router;
