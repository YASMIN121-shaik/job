import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

import "./JobHolderProfile.css";

function JobHolderProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    designation: "",
    bio: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =====================================================
     GET USER DATA
  ===================================================== */

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("user");
      const jobHolder = localStorage.getItem("jobHolder");

      let user = null;

      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (err) {
          console.log("User JSON error:", err);
        }
      }

      if (!user && jobHolder) {
        try {
          user = JSON.parse(jobHolder);
        } catch (err) {
          console.log("Job holder JSON error:", err);
        }
      }

      if (user) {
        setProfile({
          name:
            user.name ||
            user.full_name ||
            user.fullName ||
            "",
          email:
            user.email ||
            "",
          phone:
            user.phone ||
            user.mobile ||
            user.phone_number ||
            "",
          company:
            user.company ||
            user.company_name ||
            "",
          location:
            user.location ||
            "",
          designation:
            user.designation ||
            user.role ||
            "Job Holder",
          bio:
            user.bio ||
            "",
        });
      }

      /*
        If you have a backend profile endpoint,
        you can replace/add the API call here.

        Example:

        const response = await axios.get(
          "http://localhost:5000/api/jobholder/profile",
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setProfile(response.data);
      */

    } catch (err) {
      console.error("Profile loading error:", err);

      setError(
        "Unable to load profile information."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      /*
        If your backend has profile update API,
        use this:

        await axios.put(
          "http://localhost:5000/api/jobholder/profile",
          profile,
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
      */

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);

          const updatedUser = {
            ...user,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            company: profile.company,
            location: profile.location,
            designation: profile.designation,
            bio: profile.bio,
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );
        } catch (err) {
          console.log(
            "Unable to update local user:",
            err
          );
        }
      }

      setEditMode(false);

      setMessage(
        "Profile updated successfully."
      );

    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  const handleCancel = () => {
    setEditMode(false);
    setMessage("");
    setError("");

    loadProfile();
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="jhp-page">

        <div className="jhp-loading">

          <div className="jhp-spinner"></div>

          <p>
            Loading profile...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="jhp-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="jhp-header">

        <div className="jhp-heading">

          <div className="jhp-heading-icon">
            <FaUserCircle />
          </div>

          <div>
            <h1>My Profile</h1>

            <p>
              Manage your job holder account
              information.
            </p>
          </div>

        </div>


        {!editMode ? (

          <button
            className="jhp-edit-btn"
            onClick={() => {
              setEditMode(true);
              setMessage("");
              setError("");
            }}
          >
            <FaEdit />
            Edit Profile
          </button>

        ) : (

          <div className="jhp-action-buttons">

            <button
              className="jhp-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              className="jhp-save-btn"
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
          SUCCESS MESSAGE
      ================================================= */}

      {message && (
        <div className="jhp-message success">

          <FaCheckCircle />

          <span>
            {message}
          </span>

        </div>
      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="jhp-message error">

          <span>
            {error}
          </span>

        </div>
      )}


      {/* =================================================
          PROFILE LAYOUT
      ================================================= */}

      <div className="jhp-layout">

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="jhp-profile-card">

          <div className="jhp-profile-cover"></div>

          <div className="jhp-avatar-section">

            <div className="jhp-avatar">
              <FaUserCircle />
            </div>

            <div className="jhp-profile-name">

              <h2>
                {profile.name ||
                  "Job Holder"}
              </h2>

              <span>
                {profile.designation ||
                  "Employer"}
              </span>

            </div>

          </div>


          <div className="jhp-profile-summary">

            <div className="jhp-summary-item">

              <FaBriefcase />

              <div>
                <span>Role</span>

                <strong>
                  {profile.designation ||
                    "Job Holder"}
                </strong>
              </div>

            </div>


            <div className="jhp-summary-item">

              <FaBuilding />

              <div>
                <span>Company</span>

                <strong>
                  {profile.company ||
                    "Not specified"}
                </strong>
              </div>

            </div>


            <div className="jhp-summary-item">

              <FaMapMarkerAlt />

              <div>
                <span>Location</span>

                <strong>
                  {profile.location ||
                    "Not specified"}
                </strong>
              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            DETAILS CARD
        ================================================= */}

        <div className="jhp-details-card">

          <div className="jhp-card-header">

            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                Your account and contact
                information
              </p>

            </div>

            <FaUser />

          </div>


          <div className="jhp-form">

            {/* NAME */}

            <div className="jhp-field">

              <label>
                Full Name
              </label>

              <div className="jhp-input-wrapper">

                <FaUser />

                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Enter your name"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="jhp-field">

              <label>
                Email Address
              </label>

              <div className="jhp-input-wrapper">

                <FaEnvelope />

                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Enter email address"
                />

              </div>

            </div>


            {/* PHONE */}

            <div className="jhp-field">

              <label>
                Phone Number
              </label>

              <div className="jhp-input-wrapper">

                <FaPhone />

                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Enter phone number"
                />

              </div>

            </div>


            {/* COMPANY */}

            <div className="jhp-field">

              <label>
                Company Name
              </label>

              <div className="jhp-input-wrapper">

                <FaBuilding />

                <input
                  type="text"
                  name="company"
                  value={profile.company}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Enter company name"
                />

              </div>

            </div>


            {/* LOCATION */}

            <div className="jhp-field">

              <label>
                Location
              </label>

              <div className="jhp-input-wrapper">

                <FaMapMarkerAlt />

                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Enter location"
                />

              </div>

            </div>


            {/* DESIGNATION */}

            <div className="jhp-field">

              <label>
                Designation
              </label>

              <div className="jhp-input-wrapper">

                <FaBriefcase />

                <input
                  type="text"
                  name="designation"
                  value={profile.designation}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Enter designation"
                />

              </div>

            </div>


            {/* BIO */}

            <div className="jhp-field full">

              <label>
                About / Bio
              </label>

              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!editMode}
                placeholder="Tell us about yourself or your company..."
                rows="5"
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default JobHolderProfile;