const express = require("express");
const recentlyViewedController = require("./recentlyViewed.controller");
const router = express.Router();

// ==========================================
// 🕒 RECENTLY VIEWED ROUTES
// Base URL: /api/v1/recently-viewed
// Security: Protected by verifyToken in server.js
// ==========================================

// Track a new product view
// Frontend calls this when a user opens a Product Details page
router.post("/:productId", recentlyViewedController.trackView);

// Get the user's recently viewed history
// Frontend calls this to render the "Recently Viewed" carousel on the homepage
router.get("/", recentlyViewedController.getRecentlyViewed);

module.exports = router;
