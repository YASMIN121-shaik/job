const pool = require("../../db");
const supportRequestModel = require("../models/supportRequestModel");

// =====================================================
// CREATE SUPPORT REQUEST
// POST /api/support
// =====================================================

const createSupportRequest = async (req, res) => {
  try {
    const {
      email,
      subject,
      message,
      category,
      recipient,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // -------------------------------------------------
    // NORMALIZE
    // -------------------------------------------------

    const cleanEmail = email.trim().toLowerCase();

    const cleanCategory = String(
      category || "general"
    )
      .trim()
      .toLowerCase();

    const cleanRecipient = String(
      recipient || "admin"
    )
      .trim()
      .toLowerCase();

    // -------------------------------------------------
    // VALID RECIPIENT
    // -------------------------------------------------

    const allowedRecipients = [
      "admin",
      "manager",
    ];

    if (!allowedRecipients.includes(cleanRecipient)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid support recipient. Use admin or manager.",
      });
    }

    // -------------------------------------------------
    // CREATE REQUEST
    // -------------------------------------------------

    const request =
      await supportRequestModel.create({
        email: cleanEmail,
        subject: subject.trim(),
        message: message.trim(),
        category: cleanCategory,
        recipient: cleanRecipient,
      });

    // -------------------------------------------------
    // NOTIFY RECEIVER
    // -------------------------------------------------

    console.log(
      `SUPPORT REQUEST CREATED -> ${cleanRecipient}`
    );

    console.log(
      `FROM JOB SEEKER -> ${cleanEmail}`
    );

    return res.status(201).json({
      success: true,
      message:
        cleanRecipient === "manager"
          ? "Your job-related request has been sent to the manager successfully."
          : "Your account/login request has been sent to the admin successfully.",
      request,
    });
  } catch (error) {
    console.error(
      "CREATE SUPPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create support request",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL SUPPORT REQUESTS
// GET /api/support
// =====================================================

const getSupportRequests = async (req, res) => {
  try {
    const requests =
      await supportRequestModel.findAll();

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "GET SUPPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch support requests",
      error: error.message,
    });
  }
};

// =====================================================
// GET ADMIN SUPPORT REQUESTS
// GET /api/support/admin
// =====================================================

const getAdminSupportRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await supportRequestModel.findAdminRequests();

    return res.status(200).json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error(
      "GET ADMIN SUPPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch admin support requests",
      error: error.message,
    });
  }
};

// =====================================================
// GET MANAGER SUPPORT REQUESTS
// GET /api/support/manager
// =====================================================

const getManagerSupportRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await supportRequestModel.findManagerRequests();

    return res.status(200).json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error(
      "GET MANAGER SUPPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch manager support requests",
      error: error.message,
    });
  }
};

// =====================================================
// GET JOB SEEKER SUPPORT REQUESTS
// GET /api/support/my-requests?email=xxx
// =====================================================

const getMySupportRequests = async (
  req,
  res
) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const requests =
      await supportRequestModel.findByEmail(
        email.trim()
      );

    return res.status(200).json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error(
      "GET MY SUPPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch your support requests",
      error: error.message,
    });
  }
};

// =====================================================
// GET SUPPORT REQUEST BY ID
// GET /api/support/:id
// =====================================================

const getSupportRequestById = async (
  req,
  res
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid support request ID",
      });
    }

    const request =
      await supportRequestModel.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Support request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error(
      "GET SUPPORT BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch support request",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE SUPPORT REQUEST STATUS
// PUT /api/support/:id
// =====================================================

const updateSupportRequest = async (
  req,
  res
) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid support request ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "pending",
      "in_progress",
      "resolved",
      "closed",
    ];

    const normalizedStatus = String(status)
      .trim()
      .toLowerCase();

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid support request status",
      });
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const request =
      await supportRequestModel.updateStatus(
        id,
        normalizedStatus
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Support request not found",
      });
    }

    // -------------------------------------------------
    // STATUS MESSAGE
    // -------------------------------------------------

    let displayStatus = "Pending";
    let notificationMessage = "";

    if (normalizedStatus === "pending") {
      displayStatus = "Pending";

      notificationMessage =
        `Your support request "${request.subject}" is Pending.`;
    }

    if (
      normalizedStatus === "in_progress"
    ) {
      displayStatus = "In Progress";

      notificationMessage =
        `Your support request "${request.subject}" is now In Progress.`;
    }

    if (
      normalizedStatus === "resolved"
    ) {
      displayStatus = "Resolved";

      notificationMessage =
        `Your support request "${request.subject}" has been Resolved.`;
    }

    if (
      normalizedStatus === "closed"
    ) {
      displayStatus = "Closed";

      notificationMessage =
        `Your support request "${request.subject}" has been Closed.`;
    }

    // -------------------------------------------------
    // JOB SEEKER NOTIFICATION
    // -------------------------------------------------

    try {
      await pool.query(
        `
        INSERT INTO notifications
        (
          email,
          type,
          title,
          message,
          is_read,
          created_at
        )
        VALUES
        (
          $1,
          'support',
          $2,
          $3,
          FALSE,
          CURRENT_TIMESTAMP
        )
        `,
        [
          request.email,
          "Support Request Updated",
          notificationMessage,
        ]
      );

      console.log(
        "SUPPORT NOTIFICATION CREATED FOR:",
        request.email
      );
    } catch (notificationError) {
      console.error(
        "SUPPORT NOTIFICATION ERROR:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Support request updated successfully",
      status: displayStatus,
      request,
    });
  } catch (error) {
    console.error(
      "UPDATE SUPPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update support request",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE SUPPORT REQUEST
// DELETE /api/support/:id
// =====================================================

const deleteSupportRequest = async (
  req,
  res
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid support request ID",
      });
    }

    const request =
      await supportRequestModel.remove(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Support request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Support request deleted successfully",
      request,
    });
  } catch (error) {
    console.error(
      "DELETE SUPPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete support request",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createSupportRequest,
  getSupportRequests,
  getAdminSupportRequests,
  getManagerSupportRequests,
  getMySupportRequests,
  getSupportRequestById,
  updateSupportRequest,
  deleteSupportRequest,
};