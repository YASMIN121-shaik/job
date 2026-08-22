import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";

import "./JobSeekerProfile.css";

const API_URL = "http://localhost:5000/api/jobseeker";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  role: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
};

function JobSeekerProfile() {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState(emptyProfile);
  const [originalProfile, setOriginalProfile] =
    useState(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPasswordSection, setShowPasswordSection] =
    useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [deletingAccount, setDeletingAccount] =
    useState(false);

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
      console.error(
        "LOCAL STORAGE USER ERROR:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    const user = getLoggedInUser();

    return user?.id || null;
  };

  // =====================================================
  // NORMALIZE SKILLS
  // =====================================================

  const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) {
      return skills;
    }

    if (typeof skills === "string") {
      try {
        const parsed = JSON.parse(skills);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        // If normal comma-separated text was stored
        return skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  // =====================================================
  // NORMALIZE EXPERIENCE
  // =====================================================

  const normalizeExperience = (experience) => {
    if (!Array.isArray(experience)) {
      return [];
    }

    return experience.map((item) => ({
      id: item.id || null,
      role: item.role || "",
      company: item.company || "",
      duration: item.duration || "",
      description: item.description || "",
    }));
  };

  // =====================================================
  // NORMALIZE EDUCATION
  // =====================================================

  const normalizeEducation = (education) => {
    if (!Array.isArray(education)) {
      return [];
    }

    return education.map((item) => ({
      id: item.id || null,
      degree: item.degree || "",
      institution: item.institution || "",
      year: item.year || "",
    }));
  };

  // =====================================================
  // CONVERT BACKEND PROFILE
  // =====================================================

  const convertBackendProfile = (data) => {
    const backendProfile =
      data?.profile || {};

    const backendUser =
      data?.user || {};

    const backendResume =
      data?.resume || {};

    const backendExperience =
      data?.experience ||
      backendProfile?.experience ||
      [];

    const backendEducation =
      data?.education ||
      backendProfile?.education ||
      [];

    const backendSkills =
      backendProfile?.skills ??
      backendResume?.skills ??
      [];

    return {
      name:
        backendProfile?.name ||
        backendProfile?.fullname ||
        backendResume?.name ||
        backendUser?.fullname ||
        "",

      email:
        backendProfile?.email ||
        backendResume?.email ||
        backendUser?.email ||
        "",

      phone:
        backendProfile?.phone ||
        backendResume?.phone ||
        backendUser?.phone ||
        "",

      location:
        backendProfile?.location ||
        backendResume?.location ||
        "",

      role:
        backendProfile?.role ||
        backendResume?.role ||
        "",

      summary:
        backendProfile?.summary ||
        backendResume?.summary ||
        "",

      skills: normalizeSkills(
        backendSkills
      ),

      experience:
        normalizeExperience(
          backendExperience
        ),

      education:
        normalizeEducation(
          backendEducation
        ),
    };
  };

  // =====================================================
  // UPDATE LOCAL STORAGE
  // =====================================================

  const updateLocalStorage = (user) => {
    const storedUser = getLoggedInUser();

    if (!storedUser || !user) {
      return;
    }

    const updatedUser = {
      ...storedUser,

      id: user.id,

      fullname:
        user.fullname ||
        storedUser.fullname ||
        "",

      email:
        user.email ||
        storedUser.email ||
        "",

      phone:
        user.phone ||
        "",

      role:
        user.role ||
        storedUser.role ||
        "",
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );
  };

  // =====================================================
  // LOAD PROFILE
  // GET /api/jobseeker/profile/:id
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      const userId = getUserId();

      if (!userId) {
        alert(
          "User session not found. Please login again."
        );

        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/profile/${userId}`
        );

        const data = await response.json();

        console.log(
          "JOB SEEKER PROFILE RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load Job Seeker profile"
          );
        }

        if (!mounted) {
          return;
        }

        // IMPORTANT:
        // Use data.profile instead of only data.user
        const profileData =
          convertBackendProfile(data);

        console.log(
          "NORMALIZED JOB SEEKER PROFILE:",
          profileData
        );

        setProfile(profileData);
        setOriginalProfile(profileData);

        if (data.user) {
          updateLocalStorage(data.user);
        }
      } catch (error) {
        console.error(
          "JOBSEEKER PROFILE LOAD ERROR:",
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
  // HANDLE SIMPLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE SKILLS
  // =====================================================

  const handleSkillsChange = (e) => {
    const value = e.target.value;

    const skills = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setProfile((previous) => ({
      ...previous,
      skills,
    }));
  };

  // =====================================================
  // SKILLS TO TEXT
  // =====================================================

  const skillsToText = () => {
    return Array.isArray(profile.skills)
      ? profile.skills.join(", ")
      : "";
  };

  // =====================================================
  // EXPERIENCE CHANGE
  // =====================================================

  const handleExperienceChange = (
    index,
    field,
    value
  ) => {
    setProfile((previous) => {
      const updated = [
        ...previous.experience,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...previous,
        experience: updated,
      };
    });
  };

  // =====================================================
  // ADD EXPERIENCE
  // =====================================================

  const addExperience = () => {
    setProfile((previous) => ({
      ...previous,
      experience: [
        ...previous.experience,
        {
          role: "",
          company: "",
          duration: "",
          description: "",
        },
      ],
    }));
  };

  // =====================================================
  // REMOVE EXPERIENCE
  // =====================================================

  const removeExperience = (index) => {
    setProfile((previous) => ({
      ...previous,
      experience:
        previous.experience.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }));
  };

  // =====================================================
  // EDUCATION CHANGE
  // =====================================================

  const handleEducationChange = (
    index,
    field,
    value
  ) => {
    setProfile((previous) => {
      const updated = [
        ...previous.education,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...previous,
        education: updated,
      };
    });
  };

  // =====================================================
  // ADD EDUCATION
  // =====================================================

  const addEducation = () => {
    setProfile((previous) => ({
      ...previous,
      education: [
        ...previous.education,
        {
          degree: "",
          institution: "",
          year: "",
        },
      ],
    }));
  };

  // =====================================================
  // REMOVE EDUCATION
  // =====================================================

  const removeEducation = (index) => {
    setProfile((previous) => ({
      ...previous,
      education:
        previous.education.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }));
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = () => {
    setOriginalProfile({
      ...profile,
      skills: Array.isArray(profile.skills)
  ? profile.skills
  : [],
     experience: Array.isArray(profile.experience)
  ? profile.experience.map((item) => ({
      role: item.role || "",
      company: item.company || "",
      duration: item.duration || "",
      description: item.description || "",
    }))
  : [],
     education: Array.isArray(profile.education)
  ? profile.education.map((item) => ({
      degree: item.degree || "",
      institution: item.institution || "",
      year: item.year || "",
    }))
  : [],
    });

    setEditing(true);
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    setProfile({
      ...originalProfile,
      skills: [...originalProfile.skills],
      experience:
        originalProfile.experience.map(
          (item) => ({ ...item })
        ),
      education:
        originalProfile.education.map(
          (item) => ({ ...item })
        ),
    });

    setEditing(false);
  };

  // =====================================================
  // SAVE PROFILE
  // PUT /api/jobseeker/profile/:id
  // =====================================================

  const handleSave = async () => {
    const userId = getUserId();

    if (!userId) {
      alert(
        "User session not found. Please login again."
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
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullname: name,

            email: email,

            phone:
              profile.phone?.trim() || "",

            role:
              profile.role?.trim() || "",

            location:
              profile.location?.trim() || "",

            summary:
              profile.summary?.trim() || "",

            skills:
              Array.isArray(profile.skills)
                ? profile.skills
                : [],

            experience:
              Array.isArray(
                profile.experience
              )
                ? profile.experience
                : [],

            education:
              Array.isArray(
                profile.education
              )
                ? profile.education
                : [],
          }),
        }
      );

      const data = await response.json();

      console.log(
        "PROFILE UPDATE RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      const updatedProfile =
        convertBackendProfile(data);

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);

      if (data.user) {
        updateLocalStorage(data.user);
      }

      setEditing(false);

      alert(
        data.message ||
          "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "JOBSEEKER PROFILE UPDATE ERROR:",
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
  // PASSWORD INPUT
  // =====================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const userId = getUserId();

    if (!userId) {
      alert(
        "User session not found. Please login again."
      );

      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (!currentPassword.trim()) {
      alert(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword.trim()) {
      alert(
        "Please enter a new password."
      );
      return;
    }

    if (!confirmPassword.trim()) {
      alert(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "New password must be at least 6 characters."
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
        "New password must be different from your current password."
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
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password"
        );
      }

      alert(
        data.message ||
          "Password changed successfully!"
      );

      resetPasswordForm();

      setShowPasswordSection(false);
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
  // =====================================================

  const handleDeleteAccount = async () => {
    const userId = getUserId();

    if (!userId) {
      alert(
        "User session not found. Please login again."
      );

      return;
    }

    const firstConfirmation =
      window.confirm(
        "Are you sure you want to delete your account?"
      );

    if (!firstConfirmation) {
      return;
    }

    const secondConfirmation =
      window.confirm(
        "This action cannot be undone. Continue?"
      );

    if (!secondConfirmation) {
      return;
    }

    setDeletingAccount(true);

    // Backend DELETE route is not available yet.

    setDeletingAccount(false);

    alert(
      "Delete account API is not configured yet."
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="js-profile-page">
        <div
          style={{
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div className="profile-loader"></div>

          <p>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="js-profile-page">

      {/* HEADER */}

      <div className="js-profile-header">
        <div>
          <h1>My Profile</h1>

          <p>
            Manage your personal information
            and career details
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            className="js-edit-btn"
            onClick={handleEdit}
          >
            <FaEdit />
            Edit Profile
          </button>
        ) : (
          <div className="js-edit-actions">

            <button
              type="button"
              className="js-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              type="button"
              className="js-save-btn"
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

      {/* PROFILE SUMMARY */}

      <div className="js-profile-card">

        <div className="js-profile-main">

          <div className="js-profile-avatar">
            <span>
              {profile.name
                ? profile.name
                    .charAt(0)
                    .toUpperCase()
                : "J"}
            </span>
          </div>

          <div className="js-profile-basic">

            <h2>
              {profile.name ||
                "Job Seeker"}
            </h2>

            <p className="js-profile-role">
              <FaBriefcase />

              {profile.role ||
                "Job Seeker"}
            </p>

            <p className="js-profile-location">
              <FaMapMarkerAlt />

              {profile.location ||
                "Location not added"}
            </p>

            <div className="js-profile-status">
              <span></span>
              Open to work
            </div>

          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}

      <div className="js-section-card">

        <div className="js-section-heading">

          <div>
            <h2>
              Personal Information
            </h2>

            <p>
              Your basic contact information
            </p>
          </div>

          <FaUser />

        </div>

        <div className="js-form-grid">

          <div className="js-form-group">

            <label>
              Full Name
            </label>

            <div className="js-input-wrapper">

              <FaUser />

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={
                  !editing || saving
                }
                placeholder="Enter your full name"
              />

            </div>
          </div>

          <div className="js-form-group">

            <label>
              Email Address
            </label>

            <div className="js-input-wrapper">

              <FaEnvelope />

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={
                  !editing || saving
                }
                placeholder="Enter your email"
              />

            </div>
          </div>

          <div className="js-form-group">

            <label>
              Phone Number
            </label>

            <div className="js-input-wrapper">

              <FaPhone />

              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={
                  !editing || saving
                }
                placeholder="Enter your phone number"
              />

            </div>
          </div>

          <div className="js-form-group">

            <label>
              Location
            </label>

            <div className="js-input-wrapper">

              <FaMapMarkerAlt />

              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                disabled={
                  !editing || saving
                }
                placeholder="Enter your location"
              />

            </div>
          </div>

        </div>
      </div>

      {/* PROFESSIONAL INFORMATION */}

      <div className="js-section-card">

        <div className="js-section-heading">

          <div>
            <h2>
              Professional Information
            </h2>

            <p>
              Tell employers about your
              professional background
            </p>
          </div>

          <FaBriefcase />

        </div>

        <div className="js-form-grid">

          <div className="js-form-group">

            <label>
              Current Job Title
            </label>

            <div className="js-input-wrapper">

              <FaBriefcase />

              <input
                type="text"
                name="role"
                value={profile.role}
                onChange={handleChange}
                disabled={
                  !editing || saving
                }
                placeholder="e.g. Frontend Developer"
              />

            </div>
          </div>

          <div className="js-form-group">

            <label>
              Skills
            </label>

            <div className="js-input-wrapper">

              <FaGraduationCap />

              <input
                type="text"
                value={skillsToText()}
                onChange={
                  handleSkillsChange
                }
                disabled={
                  !editing || saving
                }
                placeholder="React, JavaScript, HTML, CSS"
              />

            </div>

            <small>
              Separate your skills using commas
            </small>

          </div>

          <div className="js-form-group js-full-width">

            <label>
              Professional Summary
            </label>

            <textarea
              name="summary"
              value={profile.summary}
              onChange={handleChange}
              disabled={
                !editing || saving
              }
              placeholder="Write a short professional summary..."
              rows="4"
            />

          </div>

        </div>
      </div>

      {/* EXPERIENCE */}

      <div className="js-section-card">

        <div className="js-section-heading">

          <div>
            <h2>
              Work Experience
            </h2>

            <p>
              Your professional work experience
            </p>
          </div>

          <FaBriefcase />

        </div>

        {profile.experience.length === 0 ? (
          <p className="js-empty-text">
            No work experience added yet.
          </p>
        ) : (
          profile.experience.map(
            (item, index) => (
              <div
                className="js-experience-item"
                key={
                  item.id ||
                  `experience-${index}`
                }
              >

                <div className="js-form-grid">

                  <div className="js-form-group">

                    <label>
                      Job Title
                    </label>

                    <input
                      type="text"
                      value={
                        item.role
                      }
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "role",
                          e.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      placeholder="Frontend Developer"
                    />

                  </div>

                  <div className="js-form-group">

                    <label>
                      Company
                    </label>

                    <input
                      type="text"
                      value={
                        item.company
                      }
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "company",
                          e.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      placeholder="Company name"
                    />

                  </div>

                  <div className="js-form-group">

                    <label>
                      Duration
                    </label>

                    <input
                      type="text"
                      value={
                        item.duration
                      }
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      placeholder="2024 - 2026"
                    />

                  </div>

                  <div className="js-form-group js-full-width">

                    <label>
                      Description
                    </label>

                    <textarea
                      value={
                        item.description
                      }
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      rows="3"
                      placeholder="Describe your responsibilities..."
                    />

                  </div>

                </div>

                {editing && (
                  <button
                    type="button"
                    className="js-remove-btn"
                    onClick={() =>
                      removeExperience(
                        index
                      )
                    }
                  >
                    <FaTrash />
                    Remove
                  </button>
                )}

              </div>
            )
          )
        )}

        {editing && (
          <button
            type="button"
            className="js-password-toggle-btn"
            onClick={addExperience}
          >
            + Add Experience
          </button>
        )}

      </div>

      {/* EDUCATION */}

      <div className="js-section-card">

        <div className="js-section-heading">

          <div>
            <h2>
              Education
            </h2>

            <p>
              Your educational qualifications
            </p>
          </div>

          <FaGraduationCap />

        </div>

        {profile.education.length === 0 ? (
          <p className="js-empty-text">
            No education details added yet.
          </p>
        ) : (
          profile.education.map(
            (item, index) => (
              <div
                className="js-experience-item"
                key={
                  item.id ||
                  `education-${index}`
                }
              >

                <div className="js-form-grid">

                  <div className="js-form-group">

                    <label>
                      Degree / Qualification
                    </label>

                    <input
                      type="text"
                      value={
                        item.degree
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "degree",
                          e.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      placeholder="B.Tech Computer Science"
                    />

                  </div>

                  <div className="js-form-group">

                    <label>
                      Institution
                    </label>

                    <input
                      type="text"
                      value={
                        item.institution
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "institution",
                          e.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      placeholder="College / University"
                    />

                  </div>

                  <div className="js-form-group">

                    <label>
                      Year
                    </label>

                    <input
                      type="text"
                      value={
                        item.year
                      }
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "year",
                          e.target.value
                        )
                      }
                      disabled={
                        !editing || saving
                      }
                      placeholder="2025"
                    />

                  </div>

                </div>

                {editing && (
                  <button
                    type="button"
                    className="js-remove-btn"
                    onClick={() =>
                      removeEducation(
                        index
                      )
                    }
                  >
                    <FaTrash />
                    Remove
                  </button>
                )}

              </div>
            )
          )
        )}

        {editing && (
          <button
            type="button"
            className="js-password-toggle-btn"
            onClick={addEducation}
          >
            + Add Education
          </button>
        )}

      </div>

      {/* CHANGE PASSWORD */}

      <div className="js-section-card password-section">

        <div className="js-section-heading">

          <div>
            <h2>
              Change Password
            </h2>

            <p>
              Update your account password to
              keep your account secure
            </p>
          </div>

          <FaLock />

        </div>

        {!showPasswordSection ? (

          <button
            type="button"
            className="js-password-toggle-btn"
            onClick={() =>
              setShowPasswordSection(true)
            }
          >
            <FaLock />
            Change Password
          </button>

        ) : (

          <form
            className="js-password-form"
            onSubmit={
              handleChangePassword
            }
          >

            {/* CURRENT PASSWORD */}

            <div className="js-form-group">

              <label>
                Current Password
              </label>

              <div className="js-input-wrapper password-input-wrapper">

                <FaLock />

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  disabled={
                    changingPassword
                  }
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() =>
                    setShowCurrentPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showCurrentPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>
            </div>

            {/* NEW PASSWORD */}

            <div className="js-form-group">

              <label>
                New Password
              </label>

              <div className="js-input-wrapper password-input-wrapper">

                <FaLock />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={
                    passwordData.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  disabled={
                    changingPassword
                  }
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() =>
                    setShowNewPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showNewPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

              <small>
                Password must contain at least
                6 characters.
              </small>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="js-form-group">

              <label>
                Confirm New Password
              </label>

              <div className="js-input-wrapper password-input-wrapper">

                <FaLock />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  disabled={
                    changingPassword
                  }
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>

            <div className="js-password-actions">

              <button
                type="button"
                className="js-cancel-btn"
                onClick={() => {
                  resetPasswordForm();
                  setShowPasswordSection(
                    false
                  );
                }}
                disabled={
                  changingPassword
                }
              >
                <FaTimes />
                Cancel
              </button>

              <button
                type="submit"
                className="js-save-btn"
                disabled={
                  changingPassword
                }
              >
                <FaLock />

                {changingPassword
                  ? "Updating..."
                  : "Update Password"}
              </button>

            </div>

          </form>
        )}

      </div>

      {/* DANGER ZONE */}

      <div className="js-danger-zone">

        <div className="js-danger-heading">

          <div className="js-danger-icon">
            <FaExclamationTriangle />
          </div>

          <div>
            <h2>
              Danger Zone
            </h2>

            <p>
              Permanently delete your account
              and all associated information.
            </p>
          </div>

        </div>

        <div className="js-danger-content">

          <div>
            <h3>
              Delete Account
            </h3>

            <p>
              Once your account is deleted,
              your profile information and
              account data may be permanently
              removed. This action cannot be
              undone.
            </p>
          </div>

          <button
            type="button"
            className="js-delete-account-btn"
            onClick={
              handleDeleteAccount
            }
            disabled={
              deletingAccount
            }
          >
            <FaTrash />

            {deletingAccount
              ? "Deleting..."
              : "Delete Account"}
          </button>

        </div>

      </div>

      {/* BOTTOM ACTIONS */}

      {editing && (
        <div className="js-bottom-actions">

          <button
            type="button"
            className="js-cancel-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            <FaTimes />
            Cancel
          </button>

          <button
            type="button"
            className="js-save-btn"
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
  );
}

export default JobSeekerProfile;