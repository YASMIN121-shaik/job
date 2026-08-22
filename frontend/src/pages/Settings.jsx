import "./Settings.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

const API_URL = "http://localhost:5000";

function Settings() {
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // GET settings from backend
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/admin/settings`
      );

      console.log("Settings response:", response.data);

      const admin = response.data.settings || {};

      setSettings((prev) => ({
        ...prev,
        name: admin.fullname || "",
        email: admin.email || "",
        phone: admin.phone || "",
        company: admin.company || "",
      }));
    } catch (error) {
      console.error("FETCH SETTINGS ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Failed to load settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PUT settings to backend
  const handleSave = async (e) => {
    e.preventDefault();

    if (!settings.name.trim()) {
      alert("Full name is required");
      return;
    }

    if (!settings.email.trim()) {
      alert("Email is required");
      return;
    }

    if (
      settings.password &&
      settings.password !== settings.confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(
        `${API_URL}/api/admin/settings`,
        {
          name: settings.name,
          email: settings.email,
          phone: settings.phone,
          company: settings.company,
          password: settings.password,
        }
      );

      console.log("Save response:", response.data);

      if (response.data.success) {
        alert("Settings saved successfully");

        setSettings((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
      }
    } catch (error) {
      console.error("SAVE SETTINGS ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">

      <div className="settings-header">
        <h1>⚙ Account Settings</h1>
        <p>
          Manage your profile, security and account preferences.
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="settings-card">

        <div className="top-profile">

          <FaUserCircle className="profile-icon" />

          <div className="profile-details">
            <h2>{settings.name || "Admin"}</h2>
            <p>{settings.email}</p>
          </div>

        </div>

      </div>

      {/* SETTINGS FORM */}
      <form onSubmit={handleSave}>

        <div className="settings-card">

          <h2>Profile Information</h2>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="text"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Company Name</label>

            <input
              type="text"
              name="company"
              value={settings.company}
              onChange={handleChange}
            />
          </div>

          <h2>Security</h2>

          <div className="form-group">
            <label>New Password</label>

            <input
              type="password"
              name="password"
              value={settings.password}
              onChange={handleChange}
              placeholder="Leave empty to keep current password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              value={settings.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="save-container">
            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}

export default Settings;