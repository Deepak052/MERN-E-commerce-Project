const express = require("express");
const bannerController = require("../controllers/Banner");
const router = express.Router();

router
  .post("/", bannerController.create)
  .get("/", bannerController.getAll)
  .get("/:id", bannerController.getById)
  .patch("/:id", bannerController.updateById)
  .delete("/:id", bannerController.deleteById);

module.exports = router;
