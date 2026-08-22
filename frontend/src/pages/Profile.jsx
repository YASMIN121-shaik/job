
import React, { useEffect, useState } from "react";
import "./Profile.css";

import {
  FaUserCircle,
  FaEdit,
  FaLock,
  FaSave,
  FaTrashAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";

const API_URL = "http://localhost:5000/api/manager";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  company: "",
  designation: "",
  location: "",
};

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [originalProfile, setOriginalProfile] =
    useState(emptyProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("USER DATA ERROR:", error);
      return null;
    }
  };

  // =====================================================
  // GET AUTHENTICATION TOKEN
  // =====================================================

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const user = getLoggedInUser();

    return user?.id || null;
  };

  // =====================================================
  // CONVERT BACKEND MANAGER TO PROFILE
  // =====================================================

  const convertUserToProfile = (user) => {
    return {
      name: user?.fullname || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: user?.company || "",
      designation: user?.designation || "",
      location: user?.location || "",
    };
  };

  // =====================================================
  // LOAD PROFILE
  // GET /api/manager/profile/:id
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      const userId = getUserId();
      const token = getAuthToken();

      console.log("PROFILE USER ID:", userId);
      console.log("PROFILE TOKEN EXISTS:", !!token);

      if (!userId) {
        alert(
          "User session not found. Please login again."
        );

        setLoading(false);
        return;
      }

      if (!token) {
        alert(
          "Authentication token is required. Please login again."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/profile/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("GET PROFILE RESPONSE:", data);

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load profile"
          );
        }

        if (!mounted) {
          return;
        }

        // Backend returns "manager"
        if (!data.manager) {
          throw new Error(
            "Manager profile data was not returned by the server."
          );
        }

        const profileData =
          convertUserToProfile(data.manager);

        setProfile(profileData);
        setOriginalProfile(profileData);

        // =================================================
        // SYNCHRONIZE LOCAL STORAGE
        // =================================================

        const storedUser = getLoggedInUser();

        if (storedUser) {
          const updatedUser = {
            ...storedUser,
            id: data.manager.id,
            fullname: data.manager.fullname,
            email: data.manager.email,
            phone: data.manager.phone || "",
            company: data.manager.company || "",
            designation:
              data.manager.designation || "",
            location: data.manager.location || "",
            role:
              data.manager.role || storedUser.role,
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );
        }
      } catch (error) {
        console.error(
          "PROFILE LOAD ERROR:",
          error
        );

        if (mounted) {
          alert(
            error.message ||
              "Failed to load profile"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const handleEdit = () => {
    setOriginalProfile({
      ...profile,
    });

    setIsEditing(true);
  };

  // =====================================================
  // CANCEL PROFILE EDIT
  // =====================================================

  const handleCancel = () => {
    setProfile({
      ...originalProfile,
    });

    setIsEditing(false);
  };

  // =====================================================
  // SAVE PROFILE
  // PUT /api/manager/profile/:id
  // =====================================================

  const handleSave = async () => {
    const userId = getUserId();
    const token = getAuthToken();

    console.log("SAVE PROFILE USER ID:", userId);
    console.log("SAVE PROFILE TOKEN EXISTS:", !!token);

    if (!userId) {
      alert(
        "User session not found. Please login again."
      );
      return;
    }

    if (!token) {
      alert(
        "Authentication token is required. Please login again."
      );
      return;
    }

    const name = profile.name.trim();
    const email = profile.email.trim();

    if (!name) {
      alert("Full name is required.");
      return;
    }

    if (!email) {
      alert("Email address is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullname: name,
            email: email,
            phone: profile.phone.trim(),
            company: profile.company.trim(),
            designation:
              profile.designation.trim(),
            location: profile.location.trim(),
          }),
        }
      );

      const data = await response.json();

      console.log(
        "UPDATE PROFILE RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      // =================================================
      // BACKEND RETURNS "manager"
      // =================================================

      if (!data.manager) {
        throw new Error(
          "Updated manager data was not returned by the server."
        );
      }

      const updatedProfile =
        convertUserToProfile(data.manager);

      // Update React state
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);

      // =================================================
      // UPDATE LOCAL STORAGE
      // =================================================

      const storedUser = getLoggedInUser();

      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          id: data.manager.id,
          fullname: data.manager.fullname,
          email: data.manager.email,
          phone: data.manager.phone || "",
          company: data.manager.company || "",
          designation:
            data.manager.designation || "",
          location: data.manager.location || "",
          role:
            data.manager.role || storedUser.role,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );
      }

      setIsEditing(false);

      alert(
        data.message ||
          "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // OPEN CHANGE PASSWORD
  // =====================================================

  const handleOpenPassword = () => {
    setShowPassword(true);
  };

  // =====================================================
  // CANCEL PASSWORD
  // =====================================================

  const handleCancelPassword = () => {
    setShowPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // =====================================================
  // CHANGE PASSWORD
  // PUT /api/manager/profile/:id/password
  // =====================================================

  const handleChangePassword = async () => {
    const userId = getUserId();
    const token = getAuthToken();

    if (!userId) {
      alert(
        "User session not found. Please login again."
      );
      return;
    }

    if (!token) {
      alert(
        "Authentication token is required. Please login again."
      );
      return;
    }

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert(
        "Please fill all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      alert(
        "New password must be different from current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        `${API_URL}/profile/${userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "CHANGE PASSWORD RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to change password"
        );
      }

      alert(
        data.message ||
          "Password changed successfully!"
      );

      handleCancelPassword();
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =====================================================
  // DELETE ACCOUNT
  // DELETE /api/manager/profile/:id
  // =====================================================

  const handleDeleteAccount = async () => {
    const userId = getUserId();
    const token = getAuthToken();

    if (!userId) {
      alert(
        "User session not found. Please login again."
      );
      return;
    }

    if (!token) {
      alert(
        "Authentication token is required. Please login again."
      );
      return;
    }

    const firstConfirm = window.confirm(
      "Are you sure you want to delete your account?\n\nThis action cannot be undone."
    );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm(
      "Your profile and account data may be permanently deleted.\n\nDo you really want to continue?"
    );

    if (!secondConfirm) {
      return;
    }

    try {
      setDeleting(true);

      console.log(
        "Deleting user ID:",
        userId
      );

      const response = await fetch(
        `${API_URL}/profile/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "DELETE PROFILE RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete account"
        );
      }

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert(
        data.message ||
          "Account deleted successfully."
      );

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "DELETE ACCOUNT ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to delete account. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loader"></div>

        <p>
          Loading profile...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="profile-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="profile-page-header">

        <div>
          <h1>
            My Profile
          </h1>

          <p>
            Manage your personal information
            and account settings.
          </p>
        </div>

        <div className="profile-security">

          <FaShieldAlt />

          <span>
            Account Secured
          </span>

        </div>

      </div>

      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <div className="profile-card">

        {/* PROFILE TOP */}

        <div className="profile-top">

          <div className="profile-left">

            <div className="profile-image">
              <FaUserCircle />
            </div>

            <div className="profile-info">

              <h2>
                {profile.name ||
                  "Manager"}
              </h2>

              <p className="profile-designation">

                <FaBriefcase />

                <span>
                  {profile.designation ||
                    "HR Manager"}
                </span>

              </p>

              <p className="profile-location">

                <FaMapMarkerAlt />

                <span>
                  {profile.location ||
                    "Hyderabad"}
                </span>

              </p>

            </div>

          </div>

          {!isEditing && (
            <button
              type="button"
              className="edit-btn"
              onClick={handleEdit}
            >
              <FaEdit />
              Edit Profile
            </button>
          )}

        </div>

        <div className="profile-divider"></div>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <div className="section-header">

          <h3>
            Personal Information
          </h3>

          <p>
            Update your basic profile
            information.
          </p>

        </div>

        <div className="profile-form">

          {/* FULL NAME */}

          <div className="input-group">

            <label>
              <FaUserCircle />
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={
                !isEditing ||
                saving
              }
              placeholder="Enter your full name"
            />

          </div>

          {/* EMAIL */}

          <div className="input-group">

            <label>
              <FaEnvelope />
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={
                !isEditing ||
                saving
              }
              placeholder="Enter your email"
            />

          </div>

          {/* PHONE */}

          <div className="input-group">

            <label>
              <FaPhone />
              Phone Number
            </label>

            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={
                !isEditing ||
                saving
              }
              placeholder="Enter your phone number"
            />

          </div>

          {/* COMPANY */}

          <div className="input-group">

            <label>
              <FaBuilding />
              Company
            </label>

            <input
              type="text"
              name="company"
              value={profile.company}
              onChange={handleChange}
              disabled={
                !isEditing ||
                saving
              }
              placeholder="Enter company name"
            />

          </div>

          {/* DESIGNATION */}

          <div className="input-group">

            <label>
              <FaBriefcase />
              Designation
            </label>

            <input
              type="text"
              name="designation"
              value={profile.designation}
              onChange={handleChange}
              disabled={
                !isEditing ||
                saving
              }
              placeholder="Enter designation"
            />

          </div>

          {/* LOCATION */}

          <div className="input-group">

            <label>
              <FaMapMarkerAlt />
              Location
            </label>

            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleChange}
              disabled={
                !isEditing ||
                saving
              }
              placeholder="Enter location"
            />

          </div>

        </div>

        {isEditing && (
          <div className="profile-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              type="button"
              className="save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        )}

      </div>

      {/* =================================================
          BOTTOM GRID
      ================================================= */}

      <div className="profile-bottom-grid">

        {/* =================================================
            PASSWORD & SECURITY
        ================================================= */}

        <div className="security-card">

          <div className="security-header">

            <div className="security-icon">
              <FaLock />
            </div>

            <div className="security-content">

              <h3>
                Password & Security
              </h3>

              <p>
                Keep your account secure by
                regularly updating your
                password.
              </p>

            </div>

          </div>

          {!showPassword ? (

            <div className="security-action">

              <div className="security-status">

                <FaShieldAlt />

                <span>
                  Your password is protected
                </span>

              </div>

              <button
                type="button"
                className="password-btn"
                onClick={
                  handleOpenPassword
                }
              >
                <FaLock />
                Change Password
              </button>

            </div>

          ) : (

            <div className="password-form">

              {/* CURRENT PASSWORD */}

              <div className="input-group">

                <label>
                  <FaLock />
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter current password"
                  disabled={
                    changingPassword
                  }
                />

              </div>

              {/* NEW PASSWORD */}

              <div className="input-group">

                <label>
                  <FaLock />
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Minimum 6 characters"
                  disabled={
                    changingPassword
                  }
                />

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="input-group">

                <label>
                  <FaLock />
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  disabled={
                    changingPassword
                  }
                />

              </div>

              {/* PASSWORD BUTTONS */}

              <div className="password-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    handleCancelPassword
                  }
                  disabled={
                    changingPassword
                  }
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-btn"
                  onClick={
                    handleChangePassword
                  }
                  disabled={
                    changingPassword
                  }
                >
                  <FaSave />

                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            DANGER ZONE
        ================================================= */}

        <div className="danger-zone">

          <div className="danger-header">

            <div className="danger-icon">
              <FaTrashAlt />
            </div>

            <div>

              <h3>
                Danger Zone
              </h3>

              <p>
                Permanently delete your account
                and associated data.
              </p>

            </div>

          </div>

          <div className="danger-content">

            <div>

              <h4>
                Delete Account
              </h4>

              <p>
                Once your account is deleted,
                your profile information, jobs,
                applications and account data may
                be permanently removed.
              </p>

            </div>

            <button
              type="button"
              className="delete-account-btn"
              onClick={
                handleDeleteAccount
              }
              disabled={deleting}
            >
              <FaTrashAlt />

              {deleting
                ? "Deleting..."
                : "Delete Account"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;

