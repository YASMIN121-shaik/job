import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBriefcase,
  FaPlusCircle,
  FaUsers,
  FaClipboardList,
  FaCalendarAlt,
  FaCheckCircle,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import "./JobHolderLayout.css";

function JobHolderLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("jobHolder");
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/jobholder/dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      path: "/jobholder/create-job",
      label: "Create Job",
      icon: <FaPlusCircle />,
    },
    {
      path: "/jobholder/jobs",
      label: "My Jobs",
      icon: <FaBriefcase />,
    },
    {
      path: "/jobholder/applicants",
      label: "Applicants",
      icon: <FaUsers />,
    },
    {
      path: "/jobholder/interviews",
      label: "Interviews",
      icon: <FaCalendarAlt />,
    },
    {
      path: "/jobholder/approved-jobs",
      label: "Approved Jobs",
      icon: <FaCheckCircle />,
    },
    {
      path: "/jobholder/profile",
      label: "Profile",
      icon: <FaUserCircle />,
    },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="jobholder-layout">

      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      {sidebarOpen && (
        <div
          className="jobholder-overlay"
          onClick={closeSidebar}
        />
      )}


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`jobholder-sidebar ${
          sidebarOpen ? "jobholder-sidebar-open" : ""
        }`}
      >

        {/* BRAND */}

        <div className="jobholder-brand">

          <div className="jobholder-logo">
            JP
          </div>

          <div className="jobholder-brand-text">
            <h2>Job Portal</h2>
            <span>Job Holder</span>
          </div>

          <button
            className="jobholder-close-btn"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>

        </div>


        {/* NAVIGATION */}

        <nav className="jobholder-nav">

          <p className="jobholder-nav-title">
            MAIN MENU
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `jobholder-nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span className="jobholder-nav-icon">
                {item.icon}
              </span>

              <span className="jobholder-nav-label">
                {item.label}
              </span>
            </NavLink>
          ))}

        </nav>


        {/* SIDEBAR BOTTOM */}

        <div className="jobholder-sidebar-bottom">

          <button
            className="jobholder-logout"
            onClick={handleLogout}
          >
            <span className="jobholder-nav-icon">
              <FaSignOutAlt />
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN SECTION
          ===================================================== */}

      <div className="jobholder-main">

        {/* TOP HEADER */}

        <header className="jobholder-header">

          <button
            className="jobholder-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>

          <div className="jobholder-header-content">

            <div>
              <h1>Job Holder Portal</h1>
              <p>
                Manage your jobs, applicants and interviews
              </p>
            </div>

          </div>

          <div className="jobholder-header-profile">
            <FaUserCircle />

            <div>
              <strong>Job Holder</strong>
              <span>Employer</span>
            </div>
          </div>

        </header>


        {/* PAGE CONTENT */}

        <main className="jobholder-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default JobHolderLayout;