const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    console.log("\n=== 🛡️ VERIFY TOKEN MIDDLEWARE ===");
    console.log("👉 Request URL:", req.originalUrl);
    console.log("👉 All Cookies Received:", req.cookies);

    const isAdminRoute = req.originalUrl.includes("/admin");
    console.log("👉 Is Admin Route?", isAdminRoute);

    // We only want strict, exact cookie matches now.
    const token = isAdminRoute ? req.cookies.adminToken : req.cookies.userToken;
    console.log(
      "👉 Selected Token:",
      token ? "Token is present" : "Token is MISSING",
    );

    if (!token) {
      console.log("❌ FAILED: No Cookie Found for this route.");
      return res
        .status(401)
        .json({ message: "Unauthorized Access - No Cookie Found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ SUCCESS: Token Decoded. User Role:", decoded.role);

    req.user = decoded;
    next();
  } catch (error) {
    // 🚨 THIS WILL TELL YOU EXACTLY WHY IT FAILED
    // (e.g., "jwt expired", "invalid signature", "jwt malformed")
    console.error(
      "❌ FAILED: Token Verification Error Details =>",
      error.message,
    );
    return res
      .status(401)
      .json({ message: "Invalid or Expired Token", error: error.message });
  }
};
