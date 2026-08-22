import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

import logo from "../assets/logo.jpg";
import "bootstrap-icons/font/bootstrap-icons.css";

function Navbar() {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <nav className="navbar">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <Link to="/" className="logo">
        <img
          src={logo}
          alt="Job Portal Logo"
        />

        <h2>
          Job <span>Portal</span>
        </h2>
      </Link>


      {/* =====================================================
          NAVIGATION LINKS
      ===================================================== */}

      <ul className="nav-links">

        <li>
          <a href="#hero">
            Find Jobs
          </a>
        </li>

        <li>
          <a href="#categories">
            Categories
          </a>
        </li>

        <li>
          <a href="#career">
            Career Resources
          </a>
        </li>

        <li>
          <a href="#company">
            Company Profiles
          </a>
        </li>

        <li>
          <a href="#about">
            About
          </a>
        </li>

      </ul>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="nav-buttons">

        {/* =================================================
            ACCOUNT BUTTON
        ================================================= */}

        <div className="account-menu">

          <button
            type="button"
            className={`account-btn ${
              accountOpen ? "account-btn-active" : ""
            }`}
            onClick={() =>
              setAccountOpen(!accountOpen)
            }
            aria-expanded={accountOpen}
          >

            <i className="bi bi-person-circle"></i>

            <span>
              Account
            </span>

            <i
              className={`bi ${
                accountOpen
                  ? "bi-chevron-up"
                  : "bi-chevron-down"
              } account-chevron`}
            ></i>

          </button>


          {/* =================================================
              ACCOUNT DROPDOWN
          ================================================= */}

          {accountOpen && (
            <div className="account-dropdown">

              {/* Dropdown Header */}

              <div className="account-dropdown-header">

                <div className="account-header-icon">
                  <i className="bi bi-person"></i>
                </div>

                <div>
                  <strong>
                    Welcome
                  </strong>

                  <span>
                    Access your Job Portal account
                  </span>
                </div>

              </div>


              <div className="dropdown-divider"></div>


              {/* =================================================
                  LOGIN
              ================================================= */}

              <Link
                to="/login"
                className="account-dropdown-item"
                onClick={() =>
                  setAccountOpen(false)
                }
              >

                <div className="dropdown-icon login-icon">
                  <i className="bi bi-box-arrow-in-right"></i>
                </div>

                <div className="dropdown-item-content">

                  <strong>
                    Sign In
                  </strong>

                  <span>
                    Access your account
                  </span>

                </div>

                <i className="bi bi-chevron-right dropdown-arrow"></i>

              </Link>


              {/* =================================================
                  REGISTER
              ================================================= */}

              <Link
                to="/register"
                className="account-dropdown-item"
                onClick={() =>
                  setAccountOpen(false)
                }
              >

                <div className="dropdown-icon register-icon">
                  <i className="bi bi-person-plus-fill"></i>
                </div>

                <div className="dropdown-item-content">

                  <strong>
                    Create Account
                  </strong>

                  <span>
                    Join Job Portal
                  </span>

                </div>

                <i className="bi bi-chevron-right dropdown-arrow"></i>

              </Link>


              {/* =================================================
                  DROPDOWN FOOTER
              ================================================= */}

              <div className="account-dropdown-footer">

                <i className="bi bi-shield-check"></i>

                <span>
                  Secure & trusted access
                </span>

              </div>

            </div>
          )}

        </div>


        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}

        <button
          type="button"
          className="menu-btn"
          aria-label="Open navigation menu"
        >
          <i className="bi bi-list"></i>
        </button>

      </div>

    </nav>
  );
}

export default Navbar;