import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaSearch,
  FaBookmark,
  FaBriefcase,
   FaTasks,
  FaCalendarAlt,
  FaFileAlt,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaQuestionCircle,
} from "react-icons/fa";

import "./JobSeekerLayout.css";

function JobSeekerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return {};
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error reading user:", error);
      return {};
    }
  };

  const user = getUser();

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");

    navigate("/login");
  };

  // =====================================================
  // CLOSE SIDEBAR
  // =====================================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // =====================================================
  // NAVIGATION CLASS
  // =====================================================

  const navClass = ({ isActive }) =>
    isActive
      ? "jobseeker-nav-link active"
      : "jobseeker-nav-link";

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigation = (path) => {
    navigate(path);
    closeSidebar();
  };

  // =====================================================
  // SUPPORT
  // IMPORTANT:
  // App.js route is /job-seeker/support
  // =====================================================

  const handleHelp = () => {
    navigate("/job-seeker/support");
    closeSidebar();
  };

  const handleHelpKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleHelp();
    }
  };

  // =====================================================
  // USER INFORMATION
  // =====================================================

  const userName =
    user?.fullname ||
    user?.name ||
    "Job Seeker";

  const userInitial =
    userName?.charAt(0)?.toUpperCase() || "J";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="jobseeker-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`jobseeker-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >

        {/* ================= LOGO ================= */}

        <div className="jobseeker-logo">

          <div className="jobseeker-logo-icon">
            <FaBriefcase />
          </div>

          <div className="jobseeker-logo-text">
            <h2>Job Portal</h2>
            <p>Find Your Dream Job</p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>

        </div>

        {/* ================= PROFILE ================= */}

        <div className="jobseeker-profile">

          <div className="avatar">
            {userInitial}
          </div>

          <div className="profile-info">
            <h3>{userName}</h3>
            <span>Job Seeker</span>
          </div>

        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="sidebar-menu">

          <NavLink
            end
            to="/job-seeker"
            className={navClass}
            onClick={closeSidebar}
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/job-seeker/find-jobs"
            className={navClass}
            onClick={closeSidebar}
          >
            <FaSearch />
            <span>Find Jobs</span>
          </NavLink>

          <NavLink
            to="/job-seeker/saved-jobs"
            className={navClass}
            onClick={closeSidebar}
          >
            <FaBookmark />
            <span>Saved Jobs</span>
          </NavLink>

          <NavLink
            to="/job-seeker/applications"
            className={navClass}
            onClick={closeSidebar}
          >
            <FaBriefcase />
            <span>Applications</span>
          </NavLink>
          <NavLink
  to="/job-seeker/job-tracker"
  className={navClass}
  onClick={closeSidebar}
>
  <FaTasks />
  <span>Job Tracker</span>
</NavLink>
          <NavLink
            to="/job-seeker/interviews"
            className={navClass}
            onClick={closeSidebar}
          >
            <FaCalendarAlt />
            <span>Interviews</span>
          </NavLink>

          <NavLink
            to="/job-seeker/resume"
            className={navClass}
            onClick={closeSidebar}
          >
            <FaFileAlt />
            <span>Resume</span>
          </NavLink>

          <NavLink
            to="/job-seeker/profile"
            className={navClass}
            onClick={closeSidebar}
          >
            <FaUser />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/job-seeker/notifications"
            className={navClass}
            onClick={closeSidebar}
          >
            <FaBell />
            <span>Notifications</span>
          </NavLink>

        </nav>

        {/* =================================================
            HELP / SUPPORT
        ================================================= */}

        <div
          className="help-box"
          onClick={handleHelp}
          onKeyDown={handleHelpKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Open help and support"
        >

          <div className="help-icon">
            <FaQuestionCircle />
          </div>

          <div>
            <h4>Need Help?</h4>
            <p>Contact support</p>
          </div>

        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>

      </aside>

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          className="overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="jobseeker-main">

        {/* ================= TOPBAR ================= */}

        <header className="topbar">

          <div className="topbar-left">

            <button
              type="button"
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>

          </div>

          <div className="topbar-right">

            <div
              className="user-box"
              onClick={() =>
                handleNavigation("/job-seeker/profile")
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();

                  handleNavigation(
                    "/job-seeker/profile"
                  );
                }
              }}
            >

              <div className="top-avatar">
                {userInitial}
              </div>

              <div className="top-user-info">

                <h4>{userName}</h4>

                <small>Job Seeker</small>

              </div>

            </div>

          </div>

        </header>

        {/* ================= PAGE CONTENT ================= */}

        <section className="page-content">
          <Outlet />
        </section>

      </main>

    </div>
  );
}

export default JobSeekerLayout;