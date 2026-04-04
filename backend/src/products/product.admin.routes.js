const express = require("express");
const productController = require("./product.controller");
const router = express.Router();

router.get("/", productController.getAllAdmin);
router.post("/", productController.create);
router.patch("/:id", productController.updateById);
router.patch("/undelete/:id", productController.undeleteById);
router.delete("/:id", productController.deleteById);

module.exports = router;
