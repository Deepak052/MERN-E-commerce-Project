const bcrypt = require("bcryptjs");
const Admin = require("../admins/admin.model");
const AdminOtp = require("./admin.otp.model");
const AdminPasswordResetToken = require("./admin.token.model");

const { sendMail } = require("../../utils/Emails");
const { generateOTP } = require("../../utils/GenerateOtp");
const { sanitizeUser } = require("../../utils/SanitizeUser");
const { generateToken } = require("../../utils/GenerateToken");

exports.adminLogin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ email: req.body.email });

    if (!existingAdmin || existingAdmin.isBlocked) {
      res.clearCookie("adminToken"); // 🚨 Changed
      return res
        .status(404)
        .json({ message: "Invalid Admin Credentials or Blocked" });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      existingAdmin.password,
    );
    if (!isPasswordValid) {
      res.clearCookie("adminToken"); // 🚨 Changed
      return res.status(404).json({ message: "Invalid Admin Credentials" });
    }

    const secureInfo = sanitizeUser(existingAdmin);
    const token = generateToken({ ...secureInfo, role: existingAdmin.role });

    res.cookie("adminToken", token, {
      // 🚨 Changed
      sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
      maxAge:
        parseInt(process.env.COOKIE_EXPIRATION_DAYS || 7) * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.PRODUCTION === "true",
    });
    return res.status(200).json({ ...secureInfo, role: existingAdmin.role });
  } catch (error) {
    res.status(500).json({ message: "Admin Login Error" });
  }
};

exports.adminVerifyOtp = async (req, res) => {
  try {
    const isValidAdminId = await Admin.findById(req.body.userId);
    if (!isValidAdminId)
      return res.status(404).json({ message: "Admin not Found" });

    const isOtpExisting = await AdminOtp.findOne({ admin: isValidAdminId._id });
    if (!isOtpExisting)
      return res.status(404).json({ message: "Otp not found" });

    if (isOtpExisting.expiresAt < new Date()) {
      await AdminOtp.findByIdAndDelete(isOtpExisting._id);
      return res.status(400).json({ message: "Otp has been expired" });
    }

    if (await bcrypt.compare(req.body.otp, isOtpExisting.otp)) {
      await AdminOtp.findByIdAndDelete(isOtpExisting._id);
      // Assuming Admin model has an isVerified field if they are using OTP
      const verifiedAdmin = await Admin.findByIdAndUpdate(
        isValidAdminId._id,
        { isVerified: true },
        { new: true },
      );
      // Inside adminVerifyOtp:
      return res
        .status(200)
        .json({ ...sanitizeUser(verifiedAdmin), role: verifiedAdmin.role });
    }

    return res.status(400).json({ message: "Otp is invalid" });
  } catch (error) {
    res.status(500).json({ message: "Admin Verify OTP Error" });
  }
};

exports.adminResendOtp = async (req, res) => {
  try {
    const existingAdmin = await Admin.findById(req.body.user);
    if (!existingAdmin)
      return res.status(404).json({ message: "Admin not found" });

    await AdminOtp.deleteMany({ admin: existingAdmin._id });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const newOtp = new AdminOtp({
      admin: req.body.user,
      otp: hashedOtp,
      expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
    });
    await newOtp.save();

    await sendMail(
      existingAdmin.email,
      `Partner Dashboard OTP Verification`,
      `Your Admin OTP is: <b>${otp}</b>`,
    );
    res.status(201).json({ message: "Admin OTP sent" });
  } catch (error) {
    res.status(500).json({ message: "Admin Resend OTP Error" });
  }
};

exports.adminForgotPassword = async (req, res) => {
  try {
    const isExistingAdmin = await Admin.findOne({ email: req.body.email });
    if (!isExistingAdmin)
      return res.status(404).json({ message: "Admin Email does not exist" });

    await AdminPasswordResetToken.deleteMany({ admin: isExistingAdmin._id });

    const passwordResetToken = generateToken(
      sanitizeUser(isExistingAdmin),
      true,
    );
    const hashedToken = await bcrypt.hash(passwordResetToken, 10);

    const newToken = new AdminPasswordResetToken({
      admin: isExistingAdmin._id,
      token: hashedToken,
      expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
    });
    await newToken.save();

    const adminOrigin = process.env.ADMIN_ORIGIN || "http://localhost:3000";

    await sendMail(
      isExistingAdmin.email,
      "Partner Dashboard Password Reset",
      `<p>Click here to reset your Admin password: <a href="${adminOrigin}/reset-password/${isExistingAdmin._id}/${passwordResetToken}">Reset Admin Password</a></p>`,
    );

    res
      .status(200)
      .json({ message: `Admin Reset link sent to ${isExistingAdmin.email}` });
  } catch (error) {
    res.status(500).json({ message: "Admin Forgot Password Error" });
  }
};

exports.adminResetPassword = async (req, res) => {
  try {
    const isExistingAdmin = await Admin.findById(req.body.userId);
    if (!isExistingAdmin)
      return res.status(404).json({ message: "Admin does not exist" });

    const tokenDoc = await AdminPasswordResetToken.findOne({
      admin: isExistingAdmin._id,
    });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      if (tokenDoc)
        await AdminPasswordResetToken.findByIdAndDelete(tokenDoc._id);
      return res.status(404).json({ message: "Reset Link expired or invalid" });
    }

    if (await bcrypt.compare(req.body.token, tokenDoc.token)) {
      await AdminPasswordResetToken.findByIdAndDelete(tokenDoc._id);
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await Admin.findByIdAndUpdate(isExistingAdmin._id, {
        password: hashedPassword,
      });
      return res
        .status(200)
        .json({ message: "Admin Password Updated Successfully" });
    }

    return res.status(404).json({ message: "Invalid token" });
  } catch (error) {
    res.status(500).json({ message: "Admin Reset Password Error" });
  }
};

exports.adminLogout = async (req, res) => {
  try {
    res.cookie("adminToken", "", { // 🚨 Changed
      maxAge: 0,
      sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
      httpOnly: true,
      secure: process.env.PRODUCTION === "true",
    });
    res.status(200).json({ message: "Admin Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Admin Logout Error" });
  }
};

exports.adminCheckAuth = async (req, res) => {
  try {
    if (
      req.user &&
      (req.user.role === "Admin" || req.user.role === "SuperAdmin")
    ) {
      const admin = await Admin.findById(req.user._id);
      // Inside adminCheckAuth:
      if (admin)
        return res
          .status(200)
          .json({ ...sanitizeUser(admin), role: admin.role });
    }
    res.sendStatus(401);
  } catch (error) {
    res.sendStatus(500);
  }
};
