const express = require("express");
const productController = require("./product.controller");
const router = express.Router();
const { upload } = require("../../config/cloudinary");

const productUploads = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "image0", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
]);

router.get("/", productController.getAllAdmin);
router.post("/", productUploads, productController.create);
router.patch("/:id",productUploads, productController.updateById);
router.patch("/undelete/:id", productController.undeleteById);
router.delete("/:id", productController.deleteById);

module.exports = router;
