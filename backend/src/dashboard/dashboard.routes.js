const express = require("express");
const dashboardController = require("./dashboard.controller");
const router = express.Router();

// Import security middlewares
const { verifyToken } = require("../../middlewares/verifyToken");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// ==========================================
// 🔴 ADMIN ROUTES (Protected)
// ==========================================

// Route: GET /api/v1/admin/dashboard
// Requires the user to be logged in AND have Admin privileges
router.get(
  "/",
  verifyToken,
  requireAdmin,
  dashboardController.getDashboardStats,
);

module.exports = router;
