const express = require("express");
const dashboardController = require("../controllers/Dashboard");
const { verifyToken } = require("../middleware/VerifyToken");
// NOTE: You should also add an `isAdmin` middleware here in production to protect this route!

const router = express.Router();

// Route: GET /admin/dashboard/stats
router.get("/stats", verifyToken, dashboardController.getDashboardStats);

module.exports = router;
