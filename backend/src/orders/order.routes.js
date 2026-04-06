const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");

// 🚨 FIX 1: You must import verifyToken here!
const { verifyToken } = require("../../middlewares/verifyToken");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// ==========================================
// 🔴 ADMIN ROUTES (Protected)
// ==========================================
// 🚨 FIX 2: verifyToken goes BEFORE requireAdmin
router.get("/admin", verifyToken, requireAdmin, orderController.getAllAdmin);

// Admin updates order shipping status
router.patch("/:id", verifyToken, requireAdmin, orderController.updateById);

// ==========================================
// 🟢 CUSTOMER ROUTES (Protected)
// ==========================================
// Place a new order
router.post("/", verifyToken, orderController.create);
router.post(
  "/razorpay/create",
  verifyToken,
  orderController.createRazorpayOrder,
);
router.post(
  "/razorpay/verify",
  verifyToken,
  orderController.verifyRazorpayPayment,
);

// Customer gets their own order history
router.get("/", verifyToken, orderController.getUserOrders);
router.get("/:id", verifyToken, orderController.getOrderById);

module.exports = router;
