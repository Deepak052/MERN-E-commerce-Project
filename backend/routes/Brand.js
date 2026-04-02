const express = require("express");
const brandController = require("../controllers/Brand");
const router = express.Router();

router
  .post("/", brandController.create)
  .get("/", brandController.getAll)
  .get("/:id", brandController.getById)
  .patch("/:id", brandController.updateById)
  .delete("/:id", brandController.deleteById);

module.exports = router;
