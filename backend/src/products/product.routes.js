const express = require("express");
const router = express.Router();
const productController = require("./product.controller");

// Import security middlewares
const { verifyToken } = require("../../middlewares/verifyToken");
const { requireAdmin } = require("../../middlewares/requireAdmin");
const { upload } = require("../../config/cloudinary");

const productUploads = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "image0", maxCount: 1 },
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
]);

// ==========================================
// 🟢 PUBLIC ROUTES (Customer Storefront)
// ==========================================
// Note: Static routes MUST go before parameterized routes!
router.get("/", productController.getAllPublic);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/search-suggestions", productController.getSearchSuggestions);
router.get("/deals", productController.getDealsOfTheDay);
router.get("/explore", productController.getExploreMore);
router.get("/best-sellers", productController.getBestSellers);
router.get("/budget-picks", productController.getBudgetPicks);
router.get("/flash-sale", productController.getFlashSale);
router.get("/combo-offers", productController.getComboOffers);

// Protect the recommendations route so only logged-in users can hit it
router.get("/recommended", verifyToken, productController.getRecommendations);

// ==========================================
// 🔴 ADMIN ROUTES (Protected)
// ==========================================
// Admin list all products (active and inactive)
router.get("/admin", verifyToken, requireAdmin, productController.getAllAdmin);

// Create, Update, and Delete products
router.post("/", verifyToken, requireAdmin,productUploads, productController.create);
router.patch("/:id", verifyToken, requireAdmin,productUploads, productController.updateById);
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
