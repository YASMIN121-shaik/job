import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBriefcase,
  FaUserCheck,
  FaShieldAlt,
  FaFileContract,
  FaExclamationTriangle,
  FaBan,
  FaCopyright,
  FaEnvelope,
  FaHome,
  FaLock,
  FaChevronRight,
} from "react-icons/fa";

import "./TermsConditions.css";

function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="terms-page">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="terms-header">
        <div className="terms-header-inner">

          <div
            className="terms-brand"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate("/");
            }}
          >
            <div className="terms-brand-icon">
              <FaBriefcase />
            </div>

            <div className="terms-brand-text">
              <h2>Job Portal</h2>
              <span>Career & Recruitment Platform</span>
            </div>
          </div>

          <button
            type="button"
            className="terms-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="terms-hero">

        <div className="terms-hero-glow terms-glow-one"></div>
        <div className="terms-hero-glow terms-glow-two"></div>

        <div className="terms-hero-content">

          <span className="terms-eyebrow">
            <FaFileContract />
            LEGAL INFORMATION
          </span>

          <h1>Terms & Conditions</h1>

          <p>
            Please read these Terms & Conditions carefully before
            using the Job Portal platform.
          </p>

          <div className="terms-updated">
            Last updated: August 21, 2026
          </div>

        </div>

      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}
      <main className="terms-content">

        <div className="terms-layout">

          {/* =================================================
              MAIN CONTENT
          ================================================= */}
          <article className="terms-card">

            {/* 01 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">01</span>
                <h2>Acceptance of Terms</h2>
              </div>

              <p>
                By accessing or using Job Portal, you agree to be bound
                by these Terms & Conditions. If you do not agree with
                any part of these terms, please do not use the platform.
              </p>

              <p>
                These terms apply to all visitors, registered users,
                job seekers, managers, recruiters and other users who
                access or use the services provided through Job Portal.
              </p>

            </section>


            {/* 02 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">02</span>
                <h2>Use of Our Platform</h2>
              </div>

              <p>
                Job Portal provides an online platform that allows users
                to explore employment opportunities, create profiles,
                submit applications and manage recruitment-related
                activities.
              </p>

              <ul className="terms-list">
                <li>
                  Users must provide accurate and complete information.
                </li>
                <li>
                  Users are responsible for maintaining the security of
                  their account credentials.
                </li>
                <li>
                  The platform should only be used for lawful purposes.
                </li>
                <li>
                  Users must not interfere with or attempt to disrupt
                  the operation of the platform.
                </li>
              </ul>

            </section>


            {/* 03 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">03</span>
                <h2>User Accounts</h2>
              </div>

              <p>
                Some features of Job Portal require users to create an
                account. You are responsible for ensuring that the
                information associated with your account remains
                accurate and up to date.
              </p>

              <div className="terms-info-box">

                <div className="terms-info-icon">
                  <FaUserCheck />
                </div>

                <div>
                  <strong>Account Responsibility</strong>

                  <p>
                    You are responsible for activities performed through
                    your account and should immediately notify the
                    platform administrators if you believe your account
                    has been accessed without authorization.
                  </p>
                </div>

              </div>

            </section>


            {/* 04 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">04</span>
                <h2>Job Listings & Applications</h2>
              </div>

              <p>
                Job listings displayed on Job Portal may be submitted or
                managed by employers, managers or authorized recruitment
                personnel.
              </p>

              <p>
                Job Portal does not guarantee that every job listing will
                result in employment. Users should independently verify
                employment details, company information, salary,
                responsibilities and other conditions before accepting
                an offer.
              </p>

              <ul className="terms-list">
                <li>
                  Applications should contain truthful information.
                </li>
                <li>
                  Users should not submit fraudulent resumes or
                  qualifications.
                </li>
                <li>
                  Users should not apply using another person's identity.
                </li>
                <li>
                  Employers are responsible for the accuracy of the
                  vacancies they publish.
                </li>
              </ul>

            </section>


            {/* 05 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">05</span>
                <h2>User Responsibilities</h2>
              </div>

              <p>
                Users agree to use Job Portal responsibly and respect
                other users of the platform.
              </p>

              <p>Users must not:</p>

              <ul className="terms-list terms-danger-list">
                <li>
                  Provide intentionally false or misleading information.
                </li>
                <li>
                  Attempt to access another user's account.
                </li>
                <li>
                  Upload malicious files, viruses or harmful content.
                </li>
                <li>
                  Attempt to gain unauthorized access to the platform.
                </li>
                <li>
                  Use the platform for spam, scams or fraudulent activity.
                </li>
                <li>
                  Copy or misuse platform content without authorization.
                </li>
              </ul>

            </section>


            {/* 06 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">06</span>
                <h2>Prohibited Activities</h2>
              </div>

              <div className="terms-warning-box">

                <div className="terms-warning-icon">
                  <FaBan />
                </div>

                <div>
                  <strong>Unauthorized Use</strong>

                  <p>
                    Any attempt to misuse, manipulate, damage or gain
                    unauthorized access to Job Portal may result in
                    suspension or termination of the associated account.
                  </p>
                </div>

              </div>

              <p>
                We reserve the right to investigate activities that
                violate these terms and take appropriate action where
                necessary.
              </p>

            </section>


            {/* 07 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">07</span>
                <h2>Content & Intellectual Property</h2>
              </div>

              <p>
                The design, layout, branding, logos, text, graphics,
                interface elements and other original materials available
                through Job Portal may be protected by applicable
                intellectual property laws.
              </p>

              <div className="terms-info-box">

                <div className="terms-info-icon">
                  <FaCopyright />
                </div>

                <div>
                  <strong>Respect Intellectual Property</strong>

                  <p>
                    Users may not reproduce, modify, distribute or
                    commercially exploit protected platform content
                    without appropriate authorization.
                  </p>
                </div>

              </div>

            </section>


            {/* 08 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">08</span>
                <h2>Privacy</h2>
              </div>

              <p>
                Your use of Job Portal may involve the collection and
                processing of information required to provide our
                services.
              </p>

              <p>
                Please review our Privacy Policy to understand how
                information may be collected, used and protected.
              </p>

              <button
                type="button"
                className="terms-link-btn"
                onClick={() => navigate("/privacy-policy")}
              >
                View Privacy Policy
                <FaChevronRight />
              </button>

            </section>


            {/* 09 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">09</span>
                <h2>Platform Availability</h2>
              </div>

              <p>
                We aim to keep Job Portal available and functioning
                properly. However, temporary interruptions may occur due
                to maintenance, technical problems, security issues or
                circumstances beyond our reasonable control.
              </p>

              <p>
                We do not guarantee that the platform will always be
                available, uninterrupted or completely free from errors.
              </p>

            </section>


            {/* 10 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">10</span>
                <h2>Third-Party Services</h2>
              </div>

              <p>
                Job Portal may contain links or references to third-party
                websites, services or resources.
              </p>

              <p>
                We are not responsible for the content, availability,
                privacy practices or policies of third-party services.
                Users should review the applicable terms and policies of
                those services before using them.
              </p>

            </section>


            {/* 11 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">11</span>
                <h2>Account Suspension or Termination</h2>
              </div>

              <p>
                We may suspend or terminate an account if we reasonably
                believe that the account has been used in violation of
                these Terms & Conditions or applicable laws.
              </p>

              <p>
                Users may also stop using the platform at any time.
              </p>

            </section>


            {/* 12 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">12</span>
                <h2>Limitation of Liability</h2>
              </div>

              <p>
                Job Portal provides its services on an "as available"
                basis. To the extent permitted by applicable law, we are
                not responsible for losses resulting from reliance on
                information provided by users, employers or third-party
                sources.
              </p>

              <p>
                Users are encouraged to independently verify important
                employment and recruitment information.
              </p>

            </section>


            {/* 13 */}
            <section className="terms-section">

              <div className="terms-section-heading">
                <span className="terms-number">13</span>
                <h2>Changes to These Terms</h2>
              </div>

              <p>
                We may update these Terms & Conditions from time to time
                to reflect changes to our services, policies or legal
                requirements.
              </p>

              <p>
                Updated terms will be posted on this page with a revised
                "Last updated" date.
              </p>

            </section>


            {/* 14 */}
            <section className="terms-section terms-last-section">

              <div className="terms-section-heading">
                <span className="terms-number">14</span>
                <h2>Contact Us</h2>
              </div>

              <p>
                If you have questions about these Terms & Conditions,
                please contact the Job Portal support team.
              </p>

              <div className="terms-contact-card">

                <div className="terms-contact-icon">
                  <FaEnvelope />
                </div>

                <div>
                  <span>Email Support</span>
                  <strong>support@jobportal.com</strong>
                </div>

              </div>

            </section>

          </article>


          {/* =================================================
              SIDEBAR
          ================================================= */}
          <aside className="terms-sidebar">

            <div className="terms-sidebar-card">

              <div className="terms-sidebar-icon">
                <FaShieldAlt />
              </div>

              <h3>Your Agreement</h3>

              <p>
                By continuing to use Job Portal, you acknowledge that
                you have read and understood these Terms & Conditions.
              </p>

              <button
                type="button"
                onClick={() => navigate("/")}
              >
                <FaHome />
                Return to Job Portal
              </button>

            </div>


            <div className="terms-sidebar-note">

              <FaExclamationTriangle />

              <p>
                If you do not agree with these terms, please discontinue
                use of the platform.
              </p>

            </div>

          </aside>

        </div>

      </main>


      {/* =====================================================
          PROFESSIONAL FOOTER
      ===================================================== */}
      <footer className="terms-footer">

        <div className="terms-footer-main">

          {/* Brand */}
          <div className="terms-footer-brand">

            <div className="terms-footer-logo">
              <FaBriefcase />
            </div>

            <div>
              <h3>Job Portal</h3>
              <p>
                Connecting talented people with meaningful
                career opportunities.
              </p>
            </div>

          </div>


          {/* Quick Links */}
          <div className="terms-footer-column">

            <h4>Quick Links</h4>

            <button onClick={() => navigate("/")}>
              <FaHome />
              Home
            </button>

            <button onClick={() => navigate("/login")}>
              <FaLock />
              Login
            </button>

            <button onClick={() => navigate("/register")}>
              <FaUserCheck />
              Register
            </button>

          </div>


          {/* Legal */}
          <div className="terms-footer-column">

            <h4>Legal</h4>

            <button onClick={() => navigate("/privacy-policy")}>
              Privacy Policy
            </button>

            <span className="terms-footer-current">
              Terms & Conditions
            </span>

          </div>


          {/* Support */}
          <div className="terms-footer-column terms-footer-support">

            <h4>Need Help?</h4>

            <p>
              Have questions about our platform or these terms?
            </p>

            <a href="mailto:support@jobportal.com">
              <FaEnvelope />
              support@jobportal.com
            </a>

          </div>

        </div>


        {/* Footer Bottom */}
        <div className="terms-footer-bottom">

          <p>
            © 2026 <strong>Job Portal</strong>. All rights reserved.
          </p>

          <div className="terms-footer-bottom-links">

            <button
              type="button"
              onClick={() => navigate("/privacy-policy")}
            >
              Privacy Policy
            </button>

            <span>•</span>

            <span>Terms & Conditions</span>

            <span>•</span>

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Home
            </button>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default TermsConditions;