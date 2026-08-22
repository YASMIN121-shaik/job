import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaUsers,
  FaBriefcase,
  FaBuilding,
  FaGlobe,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
  FaCheckCircle,
  FaStar,
  FaIndustry,
  FaClock,
} from "react-icons/fa";

import "./CompanyProfiles.css";

function CompanyProfiles() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [favorites, setFavorites] = useState([]);

  const companies = [
    {
      id: 1,
      name: "Microsoft",
      shortName: "MS",
      industry: "Technology",
      location: "Hyderabad, India",
      employees: "220K+",
      jobs: 128,
      rating: "4.7",
      type: "Technology",
      description:
        "Build innovative products and technologies that empower people and organizations around the world.",
      website: "microsoft.com",
      verified: true,
      featured: true,
    },
    {
      id: 2,
      name: "Tata Consultancy Services",
      shortName: "TCS",
      industry: "IT Services",
      location: "Bengaluru, India",
      employees: "600K+",
      jobs: 245,
      rating: "4.5",
      type: "IT Services",
      description:
        "A global technology and consulting organization helping businesses transform through digital innovation.",
      website: "tcs.com",
      verified: true,
      featured: true,
    },
    {
      id: 3,
      name: "Infosys",
      shortName: "IN",
      industry: "Information Technology",
      location: "Bengaluru, India",
      employees: "320K+",
      jobs: 184,
      rating: "4.4",
      type: "IT Services",
      description:
        "Global leader in next-generation digital services and consulting with opportunities across multiple domains.",
      website: "infosys.com",
      verified: true,
      featured: false,
    },
    {
      id: 4,
      name: "Google",
      shortName: "G",
      industry: "Technology",
      location: "Hyderabad, India",
      employees: "180K+",
      jobs: 96,
      rating: "4.8",
      type: "Technology",
      description:
        "Create products and services that help billions of people access information and technology.",
      website: "google.com",
      verified: true,
      featured: true,
    },
    {
      id: 5,
      name: "Accenture",
      shortName: "A",
      industry: "Consulting",
      location: "Pune, India",
      employees: "750K+",
      jobs: 210,
      rating: "4.3",
      type: "Consulting",
      description:
        "A global professional services company combining technology, strategy and industry expertise.",
      website: "accenture.com",
      verified: true,
      featured: false,
    },
    {
      id: 6,
      name: "Amazon",
      shortName: "AM",
      industry: "E-Commerce & Technology",
      location: "Chennai, India",
      employees: "1.5M+",
      jobs: 156,
      rating: "4.6",
      type: "Technology",
      description:
        "Innovate on behalf of customers and build technology that changes the way people work and live.",
      website: "amazon.com",
      verified: true,
      featured: true,
    },
  ];

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const filteredCompanies = companies.filter((company) => {
    const searchMatch =
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase());

    const locationMatch =
      company.location.toLowerCase().includes(location.toLowerCase());

    return searchMatch && locationMatch;
  });

  return (
    <div className="company-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="company-hero">

        <div className="company-hero-glow company-glow-one"></div>
        <div className="company-hero-glow company-glow-two"></div>

        <div className="company-hero-content">

          <div className="company-eyebrow">
            <FaBuilding />
            EXPLORE EMPLOYERS
          </div>

          <h1>
            Discover Companies
            <span> Where Careers Grow</span>
          </h1>

          <p>
            Explore leading companies, discover their work culture,
            and find opportunities that match your career goals.
          </p>

          {/* SEARCH */}

          <div className="company-search-box">

            <div className="company-search-field">
              <FaSearch />

              <div>
                <label>Company or Industry</label>

                <input
                  type="text"
                  placeholder="Search companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="company-search-divider"></div>

            <div className="company-search-field">

              <FaMapMarkerAlt />

              <div>
                <label>Location</label>

                <input
                  type="text"
                  placeholder="City or location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <button
              className="company-search-button"
              onClick={() => {}}
            >
              <FaSearch />
              Search
            </button>

          </div>

          {/* HERO STATS */}

          <div className="company-hero-stats">

            <div>
              <strong>500+</strong>
              <span>Companies</span>
            </div>

            <div className="company-stat-line"></div>

            <div>
              <strong>10K+</strong>
              <span>Open Positions</span>
            </div>

            <div className="company-stat-line"></div>

            <div>
              <strong>50+</strong>
              <span>Industries</span>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="company-main">

        {/* HEADER */}

        <div className="company-list-header">

          <div>
            <span className="company-small-label">
              CAREER OPPORTUNITIES
            </span>

            <h2>
              Explore Top Companies
            </h2>

            <p>
              Find organizations that are hiring talented professionals.
            </p>
          </div>

          <div className="company-result-count">
            <strong>{filteredCompanies.length}</strong>
            <span>companies found</span>
          </div>

        </div>

        {/* FEATURED */}

        <section className="featured-section">

          <div className="section-title-row">

            <div>
              <span>RECOMMENDED</span>
              <h3>Featured Employers</h3>
            </div>

            <button
              onClick={() => window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })}
            >
              View all
              <FaArrowRight />
            </button>

          </div>

          <div className="featured-grid">

            {companies
              .filter((company) => company.featured)
              .slice(0, 3)
              .map((company) => (

                <div
                  className="featured-company-card"
                  key={company.id}
                >

                  <div className="featured-top">

                    <div className="company-logo">
                      {company.shortName}
                    </div>

                    <button
                      className="favorite-button"
                      onClick={() =>
                        toggleFavorite(company.id)
                      }
                    >
                      {favorites.includes(company.id) ? (
                        <FaHeart />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>

                  </div>

                  <div className="featured-company-name">

                    <h4>
                      {company.name}

                      {company.verified && (
                        <FaCheckCircle />
                      )}
                    </h4>

                    <span>
                      {company.industry}
                    </span>

                  </div>

                  <div className="featured-location">
                    <FaMapMarkerAlt />
                    {company.location}
                  </div>

                  <div className="featured-bottom">

                    <div>
                      <strong>{company.jobs}</strong>
                      <span>Open jobs</span>
                    </div>

                    <div className="rating">
                      <FaStar />
                      <strong>{company.rating}</strong>
                    </div>

                  </div>

                  <button
                    className="view-company-button"
                    onClick={() =>
                      navigate(`/company/${company.id}`)
                    }
                  >
                    View Company
                    <FaArrowRight />
                  </button>

                </div>

              ))}

          </div>
        </section>

        {/* ALL COMPANIES */}

        <section className="all-companies">

          <div className="section-title-row">

            <div>
              <span>COMPANY DIRECTORY</span>
              <h3>All Companies</h3>
            </div>

          </div>

          {filteredCompanies.length > 0 ? (

            <div className="company-grid">

              {filteredCompanies.map((company) => (

                <article
                  className="company-card"
                  key={company.id}
                >

                  <div className="company-card-top">

                    <div className="company-logo company-logo-small">
                      {company.shortName}
                    </div>

                    <button
                      className="favorite-button"
                      onClick={() =>
                        toggleFavorite(company.id)
                      }
                    >
                      {favorites.includes(company.id) ? (
                        <FaHeart />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>

                  </div>

                  <div className="company-card-content">

                    <div className="company-name-row">

                      <h3>
                        {company.name}
                      </h3>

                      {company.verified && (
                        <FaCheckCircle className="verified-icon" />
                      )}

                    </div>

                    <span className="company-industry">
                      {company.industry}
                    </span>

                    <p>
                      {company.description}
                    </p>

                    <div className="company-meta">

                      <span>
                        <FaMapMarkerAlt />
                        {company.location}
                      </span>

                      <span>
                        <FaUsers />
                        {company.employees}
                      </span>

                    </div>

                    <div className="company-card-footer">

                      <div className="company-jobs">

                        <FaBriefcase />

                        <div>
                          <strong>
                            {company.jobs}
                          </strong>
                          <span>
                            Open positions
                          </span>
                        </div>

                      </div>

                      <div className="company-rating">
                        <FaStar />
                        {company.rating}
                      </div>

                    </div>

                    <button
                      className="company-view-button"
                      onClick={() =>
                        navigate(`/company/${company.id}`)
                      }
                    >
                      View Profile
                      <FaArrowRight />
                    </button>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="company-empty">

              <div>
                <FaBuilding />
              </div>

              <h3>No companies found</h3>

              <p>
                Try searching with a different company,
                industry or location.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setLocation("");
                }}
              >
                Clear Search
              </button>

            </div>

          )}

        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="company-cta">

          <div className="company-cta-icon">
            <FaBriefcase />
          </div>

          <div className="company-cta-content">

            <span>FOR EMPLOYERS</span>

            <h2>
              Looking for talented professionals?
            </h2>

            <p>
              Build your company presence and connect with
              qualified candidates actively looking for opportunities.
            </p>

          </div>

          <button
            onClick={() => navigate("/register")}
          >
            Create Company Profile
            <FaArrowRight />
          </button>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="company-footer">

        <div className="company-footer-inner">

          <div>
            <strong>Job Portal</strong>
            <p>
              Connecting talented people with great companies.
            </p>
          </div>

          <div className="company-footer-links">

            <button
              onClick={() => navigate("/")}
            >
              Home
            </button>

            <button
              onClick={() => navigate("/privacy-policy")}
            >
              Privacy
            </button>

            <button
              onClick={() => navigate("/terms-conditions")}
            >
              Terms
            </button>

          </div>

        </div>

        <div className="company-footer-bottom">
          © 2026 Job Portal. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default CompanyProfiles;