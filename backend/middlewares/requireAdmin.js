exports.requireAdmin = async (req, res, next) => {
  try {
    // 1. Check if the user object exists (meaning verifyToken worked)
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please login first." });
    }

    // 2. Check if the user is an Admin OR SuperAdmin
    // (This perfectly supports your previous SuperAdmin additions)
    if (req.user.isAdmin === true || req.user.isSuperAdmin === true) {
      next(); // They are allowed! Proceed to the controller.
    } else {
      return res.status(403).json({
        message:
          "Forbidden. You do not have administrator privileges to perform this action.",
      });
    }
  } catch (error) {
    console.error("Admin Verification Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error during authorization." });
  }
};
