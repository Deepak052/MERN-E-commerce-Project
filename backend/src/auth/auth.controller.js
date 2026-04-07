const bcrypt = require("bcryptjs");
const User = require("../users/user.model");
const Otp = require("./otp.model");
const PasswordResetToken = require("./token.model");

const { sendMail } = require("../../utils/Emails");
const { generateOTP } = require("../../utils/GenerateOtp");
const { sanitizeUser } = require("../../utils/SanitizeUser");
const { generateToken } = require("../../utils/GenerateToken");

exports.signup = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const createdUser = new User({ ...req.body, password: hashedPassword });
    await createdUser.save();

    const secureInfo = sanitizeUser(createdUser);
    const token = generateToken({ ...secureInfo, role: "Customer" });

    res.cookie("userToken", token, {
      sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
      maxAge:
        parseInt(process.env.COOKIE_EXPIRATION_DAYS || 7) * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.PRODUCTION === "true",
    });

    console.log("🟢 [USER SIGNUP] Success. Cookie 'userToken' set.");
    res.status(201).json({ ...secureInfo, role: "Customer" });
  } catch (error) {
    res.status(500).json({ message: "Error occured during signup" });
  }
};

exports.login = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (!existingUser || existingUser.isBlocked) {
      res.clearCookie("userToken");
      return res
        .status(404)
        .json({ message: "Invalid Credentials or Blocked" });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      res.clearCookie("userToken");
      return res.status(404).json({ message: "Invalid Credentials" });
    }

    const secureInfo = sanitizeUser(existingUser);
    const token = generateToken({ ...secureInfo, role: "Customer" });

    // 🚨 DEBUG LOGS: Check what Render is actually evaluating
    const isProd = process.env.PRODUCTION === "true";
    console.log(
      "🛠️ DEBUG: process.env.PRODUCTION is literally:",
      process.env.PRODUCTION,
    );
    console.log(
      "🛠️ DEBUG: Cookie Secure is:",
      isProd,
      "| SameSite is:",
      isProd ? "None" : "Lax",
    );

    res.cookie("userToken", token, {
      sameSite: isProd ? "None" : "Lax",
      maxAge:
        parseInt(process.env.COOKIE_EXPIRATION_DAYS || 7) * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProd, // Must be true for Cross-Origin (Netlify to Render)
    });

    console.log(
      "🟢 [USER LOGIN] Success. Cookie 'userToken' set for:",
      existingUser.email,
    );
    return res.status(200).json({ ...secureInfo, role: "Customer" });
  } catch (error) {
    console.error("🔴 [USER LOGIN] Error:", error);
    res.status(500).json({ message: "Login Error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const isValidUserId = await User.findById(req.body.userId);
    if (!isValidUserId)
      return res.status(404).json({ message: "User not Found" });

    const isOtpExisting = await Otp.findOne({ user: isValidUserId._id });
    if (!isOtpExisting)
      return res.status(404).json({ message: "Otp not found" });

    if (isOtpExisting.expiresAt < new Date()) {
      await Otp.findByIdAndDelete(isOtpExisting._id);
      return res.status(400).json({ message: "Otp has been expired" });
    }

    if (await bcrypt.compare(req.body.otp, isOtpExisting.otp)) {
      await Otp.findByIdAndDelete(isOtpExisting._id);
      const verifiedUser = await User.findByIdAndUpdate(
        isValidUserId._id,
        { isVerified: true },
        { new: true },
      );
      return res
        .status(200)
        .json({ ...sanitizeUser(verifiedUser), role: "Customer" });
    }

    return res.status(400).json({ message: "Otp is invalid" });
  } catch (error) {
    res.status(500).json({ message: "Verify OTP Error" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const existingUser = await User.findById(req.body.user);
    if (!existingUser)
      return res.status(404).json({ message: "User not found" });

    await Otp.deleteMany({ user: existingUser._id });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const newOtp = new Otp({
      user: req.body.user,
      otp: hashedOtp,
      expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
    });
    await newOtp.save();

    await sendMail(
      existingUser.email,
      `OTP Verification`,
      `Your OTP is: <b>${otp}</b>`,
    );
    res.status(201).json({ message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ message: "Resend OTP Error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const isExistingUser = await User.findOne({ email: req.body.email });
    if (!isExistingUser)
      return res.status(404).json({ message: "Email does not exist" });

    await PasswordResetToken.deleteMany({ user: isExistingUser._id });

    const passwordResetToken = generateToken(
      sanitizeUser(isExistingUser),
      true,
    );
    const hashedToken = await bcrypt.hash(passwordResetToken, 10);

    const newToken = new PasswordResetToken({
      user: isExistingUser._id,
      token: hashedToken,
      expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME),
    });
    await newToken.save();

    await sendMail(
      isExistingUser.email,
      "Password Reset Link",
      `<p>Click here to reset: <a href="${process.env.CUSTOMER_ORIGIN}/reset-password/${isExistingUser._id}/${passwordResetToken}">Reset Password</a></p>`,
    );

    res.status(200).json({ message: `Link sent to ${isExistingUser.email}` });
  } catch (error) {
    res.status(500).json({ message: "Forgot Password Error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const isExistingUser = await User.findById(req.body.userId);
    if (!isExistingUser)
      return res.status(404).json({ message: "User does not exist" });

    const tokenDoc = await PasswordResetToken.findOne({
      user: isExistingUser._id,
    });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      if (tokenDoc) await PasswordResetToken.findByIdAndDelete(tokenDoc._id);
      return res.status(404).json({ message: "Reset Link expired or invalid" });
    }

    if (await bcrypt.compare(req.body.token, tokenDoc.token)) {
      await PasswordResetToken.findByIdAndDelete(tokenDoc._id);
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.findByIdAndUpdate(isExistingUser._id, {
        password: hashedPassword,
      });
      return res.status(200).json({ message: "Password Updated Successfully" });
    }

    return res.status(404).json({ message: "Invalid token" });
  } catch (error) {
    res.status(500).json({ message: "Reset Password Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie("userToken", "", {
      maxAge: 0,
      sameSite: process.env.PRODUCTION === "true" ? "None" : "Lax",
      httpOnly: true,
      secure: process.env.PRODUCTION === "true",
    });
    console.log("🟡 [USER LOGOUT] Success. Cookie 'userToken' cleared.");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout Error" });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    console.log("🔍 [USER CHECK AUTH] Req.User contents:", req.user);

    if (req.user && req.user.role === "Customer") {
      const user = await User.findById(req.user._id);
      if (user) {
        console.log("✅ [USER CHECK AUTH] Success for user:", user.email);
        return res
          .status(200)
          .json({ ...sanitizeUser(user), role: "Customer" });
      }
    }

    console.log(
      "❌ [USER CHECK AUTH] Failed. User role mismatch or user not found.",
    );
    res.sendStatus(401);
  } catch (error) {
    console.error("🔴 [USER CHECK AUTH] Error:", error);
    res.sendStatus(500);
  }
};
