import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  FaTachometerAlt,
  FaUsers,
  FaBriefcase,
  FaChartBar,
  FaCog,
  FaUserPlus,
  FaHeadset,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});

  // =====================================================
  // LOAD LOGGED-IN ADMIN
  // =====================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Admin user data error:", error);
      setUser({});
    }
  }, []);

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
    localStorage.removeItem("role");

    navigate("/login");
  };

  // =====================================================
  // ADMIN INFORMATION
  // =====================================================

  const adminName =
    user?.fullname ||
    user?.full_name ||
    user?.name ||
    "Admin";

  const adminRole =
    user?.role ||
    "Administrator";

  const adminInitial = adminName
    ? adminName.charAt(0).toUpperCase()
    : "A";

  return (
    <div className="admin-container">

      {/* =================================================
          FIXED SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="admin-logo-section">

          <div className="admin-logo-mark">
            JP
          </div>

          <div className="admin-logo-content">

            <h2 className="admin-logo">
              Job Portal
            </h2>

            <span className="admin-panel-text">
              ADMIN PANEL
            </span>

          </div>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="admin-navigation">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>


          <NavLink
            to="/manage-users"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FaUsers />
            <span>Manage Users</span>
          </NavLink>


          <NavLink
            to="/manage-jobs"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FaBriefcase />
            <span>Manage Jobs</span>
          </NavLink>


          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FaChartBar />
            <span>Reports</span>
          </NavLink>


          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FaCog />
            <span>Settings</span>
          </NavLink>


          <NavLink
            to="/add-manager"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FaUserPlus />
            <span>Add Manager</span>
          </NavLink>


          <NavLink
            to="/support-requests"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
          >
            <FaHeadset />
            <span>Support Requests</span>
          </NavLink>

        </nav>


        {/* =================================================
            SIDEBAR FOOTER
        ================================================= */}

        <div className="admin-sidebar-footer">

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="admin-main">

        {/* =================================================
            FIXED TOP NAVBAR
        ================================================= */}

        <header className="admin-top-navbar">

          <div className="admin-navbar-left">

            <div className="admin-page-heading">

              <h3>
                Admin Dashboard
              </h3>

              <span>
                Manage your job portal
              </span>

            </div>

          </div>


          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="admin-navbar-right">

            <div className="admin-profile">

              <div className="admin-profile-icon">

                {adminName ? (
                  <span>
                    {adminInitial}
                  </span>
                ) : (
                  <FaUserCircle />
                )}

              </div>


              <div className="admin-profile-info">

                <h4>
                  {adminName}
                </h4>

                <p>
                  {adminRole}
                </p>

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            SCROLLABLE PAGE CONTENT
        ================================================= */}

        <main className="admin-page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;