const express = require("express");
const router = express.Router();
const productController = require("./product.controller");

// Import security middlewares
const { verifyToken } = require("../../middlewares/verifyToken");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// ==========================================
// 🟢 PUBLIC ROUTES (Customer Storefront)
// ==========================================
// Note: Static routes MUST go before parameterized routes!
router.get("/", productController.getAllPublic);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/search-suggestions", productController.getSearchSuggestions);

// ==========================================
// 🔴 ADMIN ROUTES (Protected)
// ==========================================
// Admin list all products (active and inactive)
router.get("/admin", verifyToken, requireAdmin, productController.getAllAdmin);

// Create, Update, and Delete products
router.post("/", verifyToken, requireAdmin, productController.create);
router.patch("/:id", verifyToken, requireAdmin, productController.updateById);
router.patch(
  "/undelete/:id",
  verifyToken,
  requireAdmin,
  productController.undeleteById,
);
router.delete("/:id", verifyToken, requireAdmin, productController.deleteById);

// ==========================================
// 🟢 PUBLIC PARAMETERIZED ROUTE
// ==========================================
// Must go at the very bottom so Express doesn't confuse "/admin" with an ID or Slug!
router.get("/:idOrSlug", productController.getByIdOrSlug);

module.exports = router;
