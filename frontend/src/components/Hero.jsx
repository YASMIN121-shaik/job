import "./Hero.css";
import hero from "../assets/hero.png";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

function Hero() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="hero">

      {/* =====================================================
          BACKGROUND DECORATIONS
      ===================================================== */}

      <div className="hero-bg-circle hero-bg-circle-one"></div>
      <div className="hero-bg-circle hero-bg-circle-two"></div>

      {/* =====================================================
          LEFT CONTENT
      ===================================================== */}

      <div className="hero-left">

        {/* TRUST BADGE */}

        <div className="hero-trust-badge">
          <span className="trust-dot"></span>

          <span>
            Trusted by
            <strong> 10,000+ professionals</strong>
          </span>

          <i className="bi bi-arrow-up-right"></i>
        </div>

        {/* =================================================
            MAIN HEADING
        ================================================= */}

        <div className="hero-text">

          <span className="hero-eyebrow">
            <i className="bi bi-briefcase-fill"></i>
            Your career starts here
          </span>

          <h1>
            Discover your
            <br />

            <span className="hero-highlight">
              dream job.
            </span>
          </h1>

          <p>
            Find meaningful opportunities from leading
            companies and take the next step toward
            a career you're proud of.
          </p>

        </div>

        {/* =================================================
            SEARCH BOX
        ================================================= */}

        <div className="hero-search">

          {/* LOCATION */}

          <div className="hero-search-field">

            <div className="hero-search-icon">
              <i className="bi bi-geo-alt"></i>
            </div>

            <div>
              <label>Location</label>

              <input
                type="text"
                placeholder="Enter location"
              />
            </div>

          </div>

          <div className="hero-search-divider"></div>

          {/* JOB */}

          <div className="hero-search-field">

            <div className="hero-search-icon">
              <i className="bi bi-search"></i>
            </div>

            <div>
              <label>Job title</label>

              <input
                type="text"
                placeholder="e.g. Software Engineer"
              />
            </div>

          </div>

          {/* SEARCH BUTTON */}

          <button
            className="hero-search-button"
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-search"></i>

            <span>
              Search Jobs
            </span>
          </button>

        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="hero-actions">

          <button
            className="hero-primary-button"
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-arrow-right-circle-fill"></i>

            <span>
              Find a Job
            </span>
          </button>

          <button
            className="hero-secondary-button"
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-file-earmark-arrow-up"></i>

            <span>
              Upload Resume
            </span>
          </button>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="hero-stats">

          <div className="hero-stat">

            <div className="hero-stat-icon">
              <i className="bi bi-briefcase"></i>
            </div>

            <div>
              <strong>20K+</strong>
              <span>Available Jobs</span>
            </div>

          </div>

          <div className="hero-stat-line"></div>

          <div className="hero-stat">

            <div className="hero-stat-icon">
              <i className="bi bi-buildings"></i>
            </div>

            <div>
              <strong>10K+</strong>
              <span>Companies</span>
            </div>

          </div>

          <div className="hero-stat-line"></div>

          <div className="hero-stat">

            <div className="hero-stat-icon">
              <i className="bi bi-people"></i>
            </div>

            <div>
              <strong>30K+</strong>
              <span>Candidates</span>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          RIGHT IMAGE
      ===================================================== */}

      <div className="hero-right">

        <div className="hero-image-wrapper">

          {/* Floating card */}

          <div className="hero-floating-card hero-card-top">

            <div className="floating-icon">
              <i className="bi bi-check-lg"></i>
            </div>

            <div>
              <strong>10K+</strong>
              <span>Successful Hires</span>
            </div>

          </div>

          {/* Image */}

          <div className="hero-image-container">

            <div className="hero-image-glow"></div>

            <img
              src={hero}
              alt="Find your dream job"
            />

          </div>

          {/* Bottom card */}

          <div className="hero-floating-card hero-card-bottom">

            <div className="floating-avatar">
              <i className="bi bi-person-fill"></i>
            </div>

            <div>
              <strong>Career Growth</strong>
              <span>Start today</span>
            </div>

            <i className="bi bi-arrow-up-right floating-arrow"></i>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;