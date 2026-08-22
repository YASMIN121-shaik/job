import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";
import Footer from "../components/Footer";

function PrivacyPolicy() {
  return (
    <div className="privacy-page">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <span className="privacy-badge">
            JOB PORTAL
          </span>

          <h1>Privacy Policy</h1>

          <p>
            Your privacy matters to us. This policy explains how Job Portal
            collects, uses, protects, and manages your information.
          </p>

          <span className="privacy-updated">
            Last Updated: August 21, 2026
          </span>
        </div>
      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}
      <main className="privacy-container">

        {/* 01 - Introduction */}
        <section className="privacy-card">
          <div className="privacy-number">01</div>

          <div>
            <h2>Introduction</h2>

            <p>
              Welcome to Job Portal. We provide an online platform that
              connects job seekers with employment opportunities and helps
              employers manage recruitment activities.
            </p>

            <p>
              By using our website and services, you acknowledge that you
              have read and understood this Privacy Policy.
            </p>
          </div>
        </section>


        {/* 02 - Information */}
        <section className="privacy-card">
          <div className="privacy-number">02</div>

          <div>
            <h2>Information We Collect</h2>

            <p>
              Depending on how you use Job Portal, we may collect information
              such as:
            </p>

            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Account login information</li>
              <li>Professional and educational information</li>
              <li>Resume and job application information</li>
              <li>Job preferences and saved jobs</li>
              <li>Interview and recruitment information</li>
              <li>Information provided when contacting support</li>
            </ul>
          </div>
        </section>


        {/* 03 - Account */}
        <section className="privacy-card">
          <div className="privacy-number">03</div>

          <div>
            <h2>Account Information</h2>

            <p>
              When you create an account, you are responsible for providing
              accurate information and keeping your login credentials secure.
            </p>

            <p>
              You should immediately notify us if you believe that your
              account has been accessed without authorization.
            </p>
          </div>
        </section>


        {/* 04 - How We Use */}
        <section className="privacy-card">
          <div className="privacy-number">04</div>

          <div>
            <h2>How We Use Your Information</h2>

            <p>
              We may use collected information to:
            </p>

            <ul>
              <li>Create and manage your account</li>
              <li>Provide job search and recruitment services</li>
              <li>Process job applications</li>
              <li>Manage interviews and recruitment activities</li>
              <li>Allow employers to review candidate information</li>
              <li>Provide customer and technical support</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent unauthorized activity</li>
              <li>Send important account and service notifications</li>
            </ul>
          </div>
        </section>


        {/* 05 - Job Applications */}
        <section className="privacy-card">
          <div className="privacy-number">05</div>

          <div>
            <h2>Job Applications</h2>

            <p>
              When you apply for a job through Job Portal, information
              associated with your application may be made available to the
              relevant employer or recruitment team for evaluation.
            </p>

            <p>
              Applicants should make sure that the information included in
              their profile and resume is accurate and appropriate for
              recruitment purposes.
            </p>
          </div>
        </section>


        {/* 06 - Information Sharing */}
        <section className="privacy-card">
          <div className="privacy-number">06</div>

          <div>
            <h2>Information Sharing</h2>

            <p>
              We do not intend to sell your personal information as a product.
              Information may be shared when necessary to provide the services
              offered through Job Portal.
            </p>

            <p>
              For example, information related to a job application may be
              shared with the employer or recruitment team responsible for
              that opportunity.
            </p>

            <p>
              Information may also be disclosed when required by applicable
              law or to protect the security and integrity of our services.
            </p>
          </div>
        </section>


        {/* 07 - Data Security */}
        <section className="privacy-card">
          <div className="privacy-number">07</div>

          <div>
            <h2>Data Security</h2>

            <p>
              We take reasonable technical and organizational measures to
              protect information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>

            <p>
              However, no internet-based service can guarantee complete
              security of information transmitted or stored electronically.
            </p>
          </div>
        </section>


        {/* 08 - Password */}
        <section className="privacy-card">
          <div className="privacy-number">08</div>

          <div>
            <h2>Passwords and Account Security</h2>

            <p>
              Your password should be kept confidential. Job Portal personnel
              will not normally ask you to provide your password.
            </p>

            <p>
              If you suspect unauthorized access to your account, please
              contact our support team as soon as possible.
            </p>
          </div>
        </section>


        {/* 09 - Cookies */}
        <section className="privacy-card">
          <div className="privacy-number">09</div>

          <div>
            <h2>Cookies and Similar Technologies</h2>

            <p>
              Job Portal may use cookies or similar technologies to support
              website functionality, remember preferences, improve performance,
              and understand how users interact with the platform.
            </p>

            <p>
              You can manage cookie preferences through your browser settings,
              although disabling certain cookies may affect website
              functionality.
            </p>
          </div>
        </section>


        {/* 10 - Third Party */}
        <section className="privacy-card">
          <div className="privacy-number">10</div>

          <div>
            <h2>Third-Party Services</h2>

            <p>
              Our platform may use third-party services for functions such as
              authentication, email delivery, hosting, analytics, or other
              technical requirements.
            </p>

            <p>
              These services may process information according to their own
              privacy policies and applicable terms.
            </p>
          </div>
        </section>


        {/* 11 - Data Retention */}
        <section className="privacy-card">
          <div className="privacy-number">11</div>

          <div>
            <h2>Data Retention</h2>

            <p>
              We retain information for as long as reasonably necessary to
              provide our services, maintain accounts, support recruitment
              activities, comply with legal obligations, resolve disputes,
              and maintain security.
            </p>
          </div>
        </section>


        {/* 12 - Privacy Choices */}
        <section className="privacy-card">
          <div className="privacy-number">12</div>

          <div>
            <h2>Your Privacy Choices</h2>

            <p>
              Depending on applicable law, you may have rights regarding your
              personal information, including the ability to:
            </p>

            <ul>
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion where legally applicable</li>
              <li>Update certain account information</li>
              <li>Withdraw certain permissions where applicable</li>
            </ul>
          </div>
        </section>


        {/* 13 - Children's Privacy */}
        <section className="privacy-card">
          <div className="privacy-number">13</div>

          <div>
            <h2>Children's Privacy</h2>

            <p>
              Job Portal is intended for users who are legally permitted to
              use employment and recruitment services. We do not knowingly
              collect personal information from children in violation of
              applicable laws.
            </p>
          </div>
        </section>


        {/* 14 - Policy Changes */}
        <section className="privacy-card">
          <div className="privacy-number">14</div>

          <div>
            <h2>Changes to This Privacy Policy</h2>

            <p>
              We may update this Privacy Policy from time to time to reflect
              changes to our services, technology, legal requirements, or
              business practices.
            </p>

            <p>
              When changes are made, the updated policy will be posted on this
              page with a revised "Last Updated" date.
            </p>
          </div>
        </section>


        {/* =====================================================
            CONTACT
        ===================================================== */}
        <section className="privacy-contact-card">

          <div>
            <span className="privacy-contact-label">
              HAVE QUESTIONS?
            </span>

            <h2>Contact Us</h2>

            <p>
              If you have questions, concerns, or requests regarding this
              Privacy Policy, please contact our support team.
            </p>

            <div className="privacy-contact-details">
              <span>support@jobportal.com</span>
              <span>+91 63048 91076</span>
              <span>Kadapa, Andhra Pradesh</span>
            </div>
          </div>

          <Link to="/login" className="privacy-back-btn">
            Go to Job Portal
          </Link>

        </section>


        {/* =====================================================
            BACK TO HOME
        ===================================================== */}
        <div className="privacy-back">
          <Link to="/">
            ← Back to Home
          </Link>
        </div>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <Footer />

    </div>
  );
}

export default PrivacyPolicy;