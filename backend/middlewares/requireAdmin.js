exports.requireAdmin = (req, res, next) => {
  // 🚨 FIX: Check for the new "Admin" role string
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    return res.status(403).json({
      message:
        "Forbidden. You do not have administrator privileges to perform this action.",
    });
  }
};
