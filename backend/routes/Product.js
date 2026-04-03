const express = require("express");
const productController = require("../controllers/Product");
const router = express.Router();

router
  .post("/", productController.create)
  .get("/", productController.getAll)
  .get("/new-arrivals", productController.getNewArrivals)
  .get("/:idOrSlug", productController.getByIdOrSlug)
  .patch("/:id", productController.updateById)
  .patch("/undelete/:id", productController.undeleteById)
  .delete("/:id", productController.deleteById)
  .get("/search-suggestions", productController.getSearchSuggestions);

module.exports = router;
