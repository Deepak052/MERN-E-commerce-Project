const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const { requireAdmin } = require("../../middlewares/requireAdmin");

// Notice these are mounted differently in server.js now
router.get("/customers", requireAdmin, adminController.getAllUsers);
router.get("/store-admins", requireAdmin, adminController.getAllAdmins);
router.post("/create-admin", requireAdmin, adminController.createStoreAdmin);

module.exports = router;
