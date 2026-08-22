import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      {/* =====================================================
          FOOTER MAIN
      ===================================================== */}
      <div className="footer-container">

        {/* ===================================================
            BRAND / ABOUT
        =================================================== */}
        <div className="footer-section footer-about">
          <h3>Job Portal</h3>

          <p>
            A professional platform where job seekers can explore
            opportunities, connect with employers, and build their
            careers with confidence.
          </p>
        </div>


        {/* ===================================================
            QUICK LINKS
        =================================================== */}
        <div className="footer-section">
          <h3>Quick Links</h3>

          <ul>
            <li>
              <a href="#hero">Find Jobs</a>
            </li>

            <li>
              <a href="#categories">Categories</a>
            </li>

            <li>
              <a href="#career">Career Resources</a>
            </li>

            <li>
              <a href="#company">Company Policies</a>
            </li>

            <li>
              <a href="#about">About Us</a>
            </li>

            <li>
              <Link to="/login">Login</Link>
            </li>

            <li>
              <Link to="/register">Register</Link>
            </li>
          </ul>
        </div>


        {/* ===================================================
            CONTACT
        =================================================== */}
        <div className="footer-section">
          <h3>Contact Us</h3>

          <p>
            <span className="footer-label">Email</span>
            support@jobportal.com
          </p>

          <p>
            <span className="footer-label">Phone</span>
            +91 63048 91076
          </p>

          <p>
            <span className="footer-label">Location</span>
            Kadapa, Andhra Pradesh
          </p>
        </div>

      </div>


      {/* =====================================================
          DIVIDER
      ===================================================== */}
      <div className="footer-divider"></div>


      {/* =====================================================
          FOOTER BOTTOM
      ===================================================== */}
      <div className="footer-bottom">

        <p>
          © 2026 Job Portal. All rights reserved.
        </p>

        <div className="footer-links">
          <Link to="/privacy-policy">
  Privacy Policy
</Link>
          <a href="/terms-conditions">Terms & Conditions</a>
          <a href="/cookie-policy">Cookie Policy</a>
          <a href="/company-profile">Company Profiles</a>

        </div>

      </div>

    </footer>
  );
}

export default Footer;