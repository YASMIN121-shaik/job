const jwt = require("jsonwebtoken");

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const authenticateToken = (req, res, next) => {
  try {
    // =====================================================
    // CHECK JWT SECRET
    // =====================================================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    // =====================================================
    // GET AUTHORIZATION HEADER
    // =====================================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    // =====================================================
    // CHECK BEARER FORMAT
    // =====================================================

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // =====================================================
    // GET TOKEN
    // =====================================================

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    // =====================================================
    // VERIFY TOKEN
    // =====================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =====================================================
    // SAVE USER IN REQUEST
    // =====================================================

    req.user = decoded;

    console.log("========================================");
    console.log("AUTHENTICATED USER");
    console.log({
      id: decoded.id,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });
    console.log("========================================");

    return next();

  } catch (error) {
    console.error(
      "AUTHENTICATION ERROR:",
      error.message
    );

    // =====================================================
    // EXPIRED TOKEN
    // =====================================================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Your session has expired. Please login again.",
      });
    }

    // =====================================================
    // INVALID TOKEN
    // =====================================================

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // =====================================================
    // OTHER ERROR
    // =====================================================

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};


// =====================================================
// AUTHORIZATION MIDDLEWARE
// =====================================================
//
// Usage:
//
// authorizeRoles("admin")
// authorizeRoles("job_holder")
// authorizeRoles("admin", "manager")
//
// =====================================================

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // -------------------------------------------------
      // USER MUST BE AUTHENTICATED FIRST
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

      const userRole = String(
        req.user.role || ""
      )
        .trim()
        .toLowerCase();

      // -------------------------------------------------
      // NO ROLE
      // -------------------------------------------------

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "User role is missing",
        });
      }

      // -------------------------------------------------
      // NORMALIZE ALLOWED ROLES
      // -------------------------------------------------

      const normalizedRoles = allowedRoles.map(
        (role) =>
          String(role)
            .trim()
            .toLowerCase()
      );

      console.log("========================================");
      console.log("ROLE AUTHORIZATION");
      console.log("User Role:", userRole);
      console.log(
        "Allowed Roles:",
        normalizedRoles
      );
      console.log("========================================");

      // -------------------------------------------------
      // CHECK ROLE
      // -------------------------------------------------

      if (!normalizedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to access this resource.",
          currentRole: userRole,
          allowedRoles: normalizedRoles,
        });
      }

      // -------------------------------------------------
      // AUTHORIZED
      // -------------------------------------------------

      return next();

    } catch (error) {
      console.error(
        "ROLE AUTHORIZATION ERROR:",
        error
      );

      return res.status(403).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  authenticateToken,
  authorizeRoles,
};