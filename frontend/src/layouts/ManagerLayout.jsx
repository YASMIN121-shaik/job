import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";
import "./ManagerLayout.css";

import {
  FaSignOutAlt,
  FaTachometerAlt,
  FaPlusCircle,
  FaBriefcase,
  FaUsers,
  FaUserTie,
  FaCalendarAlt,
  FaCheckCircle,
  FaUserCircle,
  FaLifeRing,
} from "react-icons/fa";

function ManagerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({});

  // =====================================================
  // LOAD LOGGED-IN MANAGER
  // =====================================================

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          setUser({});
        }
      } catch (error) {
        console.error("User data error:", error);
        setUser({});
      }
    };

    loadUser();
  }, [location.pathname]);

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
  // GET MANAGER INITIAL
  // =====================================================

  const managerName = user?.fullname || user?.name || "Manager";

  const managerInitial = managerName
    .charAt(0)
    .toUpperCase();

  return (
    <div className="manager-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="manager-sidebar">

        {/* LOGO */}

        <div className="manager-logo-section">

          <div className="manager-logo-mark">
            JP
          </div>

          <div className="manager-logo-text">
            <h2>JOB PORTAL</h2>
            <p>Manager Panel</p>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="manager-navigation">

          <p className="manager-nav-title">
            MAIN MENU
          </p>

          <ul>

            {/* Dashboard */}

            <li>
              <NavLink
                to="/manager-dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaTachometerAlt />
                </span>

                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* Create Job */}

            <li>
              <NavLink
                to="/create-job"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaPlusCircle />
                </span>

                <span>Create Job</span>
              </NavLink>
            </li>

            {/* Total Jobs */}

            <li>
              <NavLink
                to="/total-jobs"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaBriefcase />
                </span>

                <span>Total Jobs</span>
              </NavLink>
            </li>

            {/* Applicants */}

            <li>
              <NavLink
                to="/applicants"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaUsers />
                </span>

                <span>Applicants</span>
              </NavLink>
            </li>

            {/* Recruiters */}

            <li>
              <NavLink
                to="/recruiters"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaUserTie />
                </span>

                <span>Recruiters</span>
              </NavLink>
            </li>

            {/* Interviews */}

            <li>
              <NavLink
                to="/manager/interviews"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaCalendarAlt />
                </span>

                <span>Interviews</span>
              </NavLink>
            </li>

            {/* Approved Jobs */}

            <li>
              <NavLink
                to="/approved-jobs"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaCheckCircle />
                </span>

                <span>Approved Jobs</span>
              </NavLink>
            </li>

          </ul>

          {/* =================================================
              ACCOUNT
          ================================================= */}

          <p className="manager-nav-title account-title">
            ACCOUNT
          </p>

          <ul>

            {/* Profile */}

            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaUserCircle />
                </span>

                <span>Profile</span>
              </NavLink>
            </li>

            {/* Support */}

            <li>
              <NavLink
                to="/manager-support"
                className={({ isActive }) =>
                  isActive
                    ? "manager-nav-link active"
                    : "manager-nav-link"
                }
              >
                <span className="manager-nav-icon">
                  <FaLifeRing />
                </span>

                <span>Support Requests</span>
              </NavLink>
            </li>

          </ul>

        </nav>

        {/* =================================================
            SIDEBAR USER
        ================================================= */}

        <div className="manager-sidebar-user">

          <div className="manager-sidebar-avatar">
            {managerInitial}
          </div>

          <div className="manager-sidebar-user-info">
            <strong>{managerName}</strong>

            <span>
              {user?.role || "Manager"}
            </span>
          </div>

        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="manager-logout-wrapper">

          <button
            type="button"
            className="manager-logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt />

            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="manager-main">

        {/* =================================================
            TOP NAVBAR
        ================================================= */}

        <header className="manager-navbar">

          <div className="manager-navbar-left">

            <div className="manager-page-heading">

              <h1>Manager Dashboard</h1>

              <p>
                Manage jobs, applicants and recruitment activities
              </p>

            </div>

          </div>

          {/* PROFILE */}

          <div className="manager-navbar-right">

            <div className="manager-profile-section">

              <div className="manager-profile-icon">
                <span>{managerInitial}</span>
              </div>

              <div className="manager-profile-details">

                <h4>
                  {managerName}
                </h4>

                <p>
                  {user?.role || "Manager"}
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <section className="manager-content">
          <Outlet />
        </section>

      </main>

    </div>
  );
}

export default ManagerLayout;