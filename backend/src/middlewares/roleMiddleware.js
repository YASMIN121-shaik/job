// =====================================================
// ROLE AUTHORIZATION MIDDLEWARE
// =====================================================

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // -------------------------------------------------
      // CHECK AUTHENTICATED USER
      // -------------------------------------------------

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // -------------------------------------------------
      // GET USER ROLE
      // -------------------------------------------------

      const userRole = req.user.role;

      // -------------------------------------------------
      // CHECK ROLE
      // -------------------------------------------------

      if (!allowedRoles.includes(userRole)) {
        console.log(
          `Access denied for role: ${userRole}`
        );

        return res.status(403).json({
          success: false,
          message:
            "Access denied. You do not have permission.",
        });
      }

      next();

    } catch (error) {
      console.error(
        "ROLE AUTHORIZATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

module.exports = {
  authorizeRoles,
};