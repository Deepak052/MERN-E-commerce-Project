const express = require("express");
const router = express.Router();
const bannerController = require("./banner.controller");
const { upload } = require("../../config/cloudinary"); // 🚨 NEW

const { verifyToken } = require("../../middlewares/verifyToken");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// 🚨 Setup Multer to look for the "image" field
const bannerUpload = upload.single("image");

router.get("/", bannerController.getAllPublic);
router.get("/admin", verifyToken, requireAdmin, bannerController.getAllAdmin);
router.get("/:id", verifyToken, requireAdmin, bannerController.getById);

// 🚨 Inject Multer into the create and update routes
router.post(
  "/",
  verifyToken,
  requireAdmin,
  bannerUpload,
  bannerController.create,
);
router.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  bannerUpload,
  bannerController.updateById,
);

router.delete("/:id", verifyToken, requireAdmin, bannerController.deleteById);

module.exports = router;
