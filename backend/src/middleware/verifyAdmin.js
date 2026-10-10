const UserModel = require("../models/UserModel");

const adminOnly = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  try {
    let role = String(req.user.role || "").trim().toLowerCase();

    // If role in JWT token is not admin, verify latest role from database
    if (role !== "admin") {
      const user = await UserModel.findById(req.user.id);
      if (user) {
        role = String(user.role || "").trim().toLowerCase();
        req.user.role = role;
      }
    }

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin permission required.",
      });
    }

    next();
  } catch (error) {
    console.error("verifyAdmin authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization.",
    });
  }
};

module.exports = adminOnly;
