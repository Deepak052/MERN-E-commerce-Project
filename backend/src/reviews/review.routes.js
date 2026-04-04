const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const { verifyToken } = require("../../middlewares/verifyToken");

// ==========================================
// 🟢 PUBLIC ROUTES
// ==========================================
// Anyone can view reviews for a product
router.get("/product/:id", reviewController.getByProductId);

// ==========================================
// 🔴 PROTECTED ROUTES (Requires Login)
// ==========================================
// Users must be logged in to post, edit, or delete a review
router.post("/", verifyToken, reviewController.create);
router.patch("/:id", verifyToken, reviewController.updateById);
router.delete("/:id", verifyToken, reviewController.deleteById);

module.exports = router;
