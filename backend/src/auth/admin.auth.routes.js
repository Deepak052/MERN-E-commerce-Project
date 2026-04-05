const express = require("express");
const router = express.Router();
const adminAuthController = require("./admin.auth.controller");
const { verifyToken } = require("../../middlewares/verifyToken");

router.post("/login", adminAuthController.adminLogin);
router.post("/verify-otp", adminAuthController.adminVerifyOtp);
router.post("/resend-otp", adminAuthController.adminResendOtp);
router.post("/forgot-password", adminAuthController.adminForgotPassword);
router.post("/reset-password", adminAuthController.adminResetPassword);
router.get("/logout", adminAuthController.adminLogout);
router.get("/check-auth", verifyToken, adminAuthController.adminCheckAuth);

module.exports = router;
