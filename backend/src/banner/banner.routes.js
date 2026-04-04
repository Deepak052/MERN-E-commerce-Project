const express = require("express");
const router = express.Router();
const bannerController = require("./banner.controller");

// Import security middlewares
const { verifyToken } = require("../../middlewares/verifyToken");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// ==========================================
// 🟢 PUBLIC ROUTES (Customer Storefront)
// ==========================================
router.get("/", bannerController.getAllPublic);

// ==========================================
// 🔴 ADMIN ROUTES (Protected)
// ==========================================
// Static route first
router.get("/admin", verifyToken, requireAdmin, bannerController.getAllAdmin);

// Parameterized routes
router.post("/", verifyToken, requireAdmin, bannerController.create);
router.get("/:id", verifyToken, requireAdmin, bannerController.getById);
router.patch("/:id", verifyToken, requireAdmin, bannerController.updateById);
router.delete("/:id", verifyToken, requireAdmin, bannerController.deleteById);

module.exports = router;
