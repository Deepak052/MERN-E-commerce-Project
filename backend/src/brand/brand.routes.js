const express = require("express");
const router = express.Router();
const brandController = require("./brand.controller");

// Import security middlewares
const { verifyToken } = require("../../middlewares/verifyToken");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// ==========================================
// 🟢 PUBLIC ROUTES (Customer Storefront)
// ==========================================
router.get("/", brandController.getAllPublic);

// ==========================================
// 🔴 ADMIN ROUTES (Protected)
// ==========================================
// Static route first
router.get("/admin", verifyToken, requireAdmin, brandController.getAllAdmin);

// Parameterized routes
router.post("/", verifyToken, requireAdmin, brandController.create);
router.get("/:id", verifyToken, requireAdmin, brandController.getById);
router.patch("/:id", verifyToken, requireAdmin, brandController.updateById);
router.delete("/:id", verifyToken, requireAdmin, brandController.deleteById);

module.exports = router;
