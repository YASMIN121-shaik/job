import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Footer from "../components/Footer";
import "./Home.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Home() {
  return (
    <div className="home-page">

      <Navbar />

      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <Hero />


        {/* =====================================================
            CATEGORIES
        ===================================================== */}

        <Categories />


        {/* =====================================================
            CAREER RESOURCES
        ===================================================== */}

        <section id="career" className="home-section career-section">

          <div className="home-section-container">

            <div className="section-heading">

              <span className="section-eyebrow">
                <i className="bi bi-compass"></i>
                Career Support
              </span>

              <h2>
                Everything you need to
                <span> grow your career</span>
              </h2>

              <p>
                Get the tools, guidance, and resources you need
                to build a stronger career and find the right
                opportunities.
              </p>

            </div>


            <div className="resource-grid">

              {/* Resume */}

              <div className="resource-card">

                <div className="resource-card-top">

                  <div className="resource-icon">
                    <i className="bi bi-file-earmark-person"></i>
                  </div>

                  <span className="resource-number">
                    01
                  </span>

                </div>

                <h3>
                  Resume Builder
                </h3>

                <p>
                  Create a professional resume that highlights
                  your skills, experience, and achievements.
                </p>

                <div className="resource-link">
                  Build your resume

                  <i className="bi bi-arrow-up-right"></i>
                </div>

              </div>


              {/* Interview */}

              <div className="resource-card">

                <div className="resource-card-top">

                  <div className="resource-icon">
                    <i className="bi bi-camera-video"></i>
                  </div>

                  <span className="resource-number">
                    02
                  </span>

                </div>

                <h3>
                  Interview Preparation
                </h3>

                <p>
                  Prepare for technical and HR interviews with
                  practical guidance and useful resources.
                </p>

                <div className="resource-link">
                  Prepare for interviews

                  <i className="bi bi-arrow-up-right"></i>
                </div>

              </div>


              {/* Guidance */}

              <div className="resource-card">

                <div className="resource-card-top">

                  <div className="resource-icon">
                    <i className="bi bi-lightbulb"></i>
                  </div>

                  <span className="resource-number">
                    03
                  </span>

                </div>

                <h3>
                  Career Guidance
                </h3>

                <p>
                  Discover career paths, improve your skills,
                  and make confident career decisions.
                </p>

                <div className="resource-link">
                  Explore guidance

                  <i className="bi bi-arrow-up-right"></i>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            COMPANY PROFILES
        ===================================================== */}

        <section
          id="company"
          className="home-section company-section"
        >

          <div className="home-section-container">

            <div className="company-layout">

              {/* Left */}

              <div className="company-content">

                <span className="section-eyebrow">
                  <i className="bi bi-buildings"></i>
                  Explore Employers
                </span>

                <h2>
                  Find companies where
                  <span> great careers begin.</span>
                </h2>

                <p>
                  Learn about leading employers, discover their
                  work culture, and find opportunities that match
                  your career goals.
                </p>

                <button
                  className="company-button"
                  type="button"
                >
                  Explore Companies

                  <i className="bi bi-arrow-right"></i>
                </button>

              </div>


              {/* Right */}

              <div className="company-cards">

                <div className="company-card">

                  <div className="company-card-icon">
                    <i className="bi bi-trophy"></i>
                  </div>

                  <div>
                    <h3>
                      Top Employers
                    </h3>

                    <p>
                      Discover trusted employers
                      across industries.
                    </p>
                  </div>

                  <i className="bi bi-arrow-up-right company-arrow"></i>

                </div>


                <div className="company-card">

                  <div className="company-card-icon">
                    <i className="bi bi-people"></i>
                  </div>

                  <div>
                    <h3>
                      Company Culture
                    </h3>

                    <p>
                      Learn about workplace culture,
                      benefits, and values.
                    </p>
                  </div>

                  <i className="bi bi-arrow-up-right company-arrow"></i>

                </div>


                <div className="company-card">

                  <div className="company-card-icon">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>

                  <div>
                    <h3>
                      Growth Opportunities
                    </h3>

                    <p>
                      Find internships and long-term
                      career opportunities.
                    </p>
                  </div>

                  <i className="bi bi-arrow-up-right company-arrow"></i>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ABOUT
        ===================================================== */}

        <section
          id="about"
          className="home-section about-section"
        >

          <div className="home-section-container">

            <div className="about-layout">

              {/* About Content */}

              <div className="about-content">

                <span className="section-eyebrow">
                  <i className="bi bi-stars"></i>
                  About Job Portal
                </span>

                <h2>
                  Connecting talent with
                  <span> opportunity.</span>
                </h2>

                <p>
                  Our platform simplifies the job search process
                  by connecting talented professionals with
                  trusted employers.
                </p>

                <p>
                  Explore thousands of opportunities, discover
                  companies, and take the next step toward a
                  career you're proud of.
                </p>

                <div className="about-checks">

                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Verified opportunities
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Trusted employers
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Career-focused resources
                  </div>

                </div>

              </div>


              {/* Stats */}

              <div className="about-stats">

                <div className="about-stat-card">

                  <div className="about-stat-icon">
                    <i className="bi bi-briefcase"></i>
                  </div>

                  <h3>
                    10K+
                  </h3>

                  <span>
                    Job Listings
                  </span>

                </div>


                <div className="about-stat-card">

                  <div className="about-stat-icon">
                    <i className="bi bi-buildings"></i>
                  </div>

                  <h3>
                    500+
                  </h3>

                  <span>
                    Companies
                  </span>

                </div>


                <div className="about-stat-card">

                  <div className="about-stat-icon">
                    <i className="bi bi-people"></i>
                  </div>

                  <h3>
                    25K+
                  </h3>

                  <span>
                    Users
                  </span>

                </div>


                <div className="about-stat-card">

                  <div className="about-stat-icon">
                    <i className="bi bi-heart"></i>
                  </div>

                  <h3>
                    95%
                  </h3>

                  <span>
                    Satisfaction
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="home-cta">

          <div className="home-cta-decoration"></div>

          <div className="home-cta-content">

            <span className="cta-icon">
              <i className="bi bi-rocket-takeoff"></i>
            </span>

            <h2>
              Ready to take the next step?
            </h2>

            <p>
              Your next opportunity could be closer than you think.
              Start exploring today.
            </p>

            <div className="cta-actions">

              <button
                type="button"
                onClick={() =>
                  window.location.href = "/login"
                }
              >
                Find Your Dream Job

                <i className="bi bi-arrow-right"></i>
              </button>

              <button
                type="button"
                className="cta-secondary"
                onClick={() =>
                  window.location.href = "/register"
                }
              >
                Create Free Account
              </button>

            </div>

          </div>

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default Home;