const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");

// Import security middlewares
const { verifyToken } = require("../../middlewares/verifyToken");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// ==========================================
// 🟢 PUBLIC ROUTES (Customer Storefront)
// ==========================================
router.get("/", categoryController.getAllPublic);
router.get("/roots", categoryController.getRootsPublic);

// ==========================================
// 🔴 ADMIN ROUTES (Protected)
// ==========================================

// Static routes
router.get("/admin", verifyToken, requireAdmin, categoryController.getAllAdmin);
router.get(
  "/admin/roots",
  verifyToken,
  requireAdmin,
  categoryController.getRootsAdmin,
);

// Parameterized routes
router.post("/", verifyToken, requireAdmin, categoryController.create);
router.get("/admin/:id", verifyToken, requireAdmin, categoryController.getById);
router.patch("/:id", verifyToken, requireAdmin, categoryController.updateById);
router.delete("/:id", verifyToken, requireAdmin, categoryController.deleteById);

module.exports = router;
