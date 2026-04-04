const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// ==========================================
// 🔴 ADMIN ROUTES (Static routes must go first)
// ==========================================

// Get list of regular customers
router.get("/customers", requireAdmin, userController.getAllUsers);

// Get list of store admins
router.get("/store-admins", requireAdmin, userController.getAllAdmins);

// SuperAdmin creates a new store admin
router.post("/create-admin", requireAdmin, userController.createStoreAdmin);

// ==========================================
// 🟢 PUBLIC ROUTES (Parameterized routes go last)
// ==========================================

// Get a specific user (Used by customer for profile, or admin viewing a customer)
router.get("/:id", userController.getById);

// Update a specific user (Customer updating name, or admin blocking them)
router.patch("/:id", userController.updateById);

module.exports = router;
