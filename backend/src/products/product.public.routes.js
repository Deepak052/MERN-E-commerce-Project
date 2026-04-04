const express = require("express");
const productController = require("./product.controller");
const router = express.Router();

// Static routes MUST go before parameterized routes
router.get("/", productController.getAllPublic);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/search-suggestions", productController.getSearchSuggestions);

// Parameterized routes at the bottom
router.get("/:idOrSlug", productController.getByIdOrSlug);

module.exports = router;
