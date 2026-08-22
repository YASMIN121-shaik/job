import "./Categories.css";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "IT & Software",
      jobs: "120 Jobs Available",
      icon: "bi bi-laptop",
    },
    {
      title: "Marketing",
      jobs: "80 Jobs Available",
      icon: "bi bi-megaphone",
    },
    {
      title: "Finance",
      jobs: "65 Jobs Available",
      icon: "bi bi-cash-stack",
    },
    {
      title: "Healthcare",
      jobs: "55 Jobs Available",
      icon: "bi bi-heart-pulse",
    },
    {
      title: "Education",
      jobs: "40 Jobs Available",
      icon: "bi bi-mortarboard",
    },
    {
      title: "Engineering",
      jobs: "95 Jobs Available",
      icon: "bi bi-gear",
    },
  ];

  return (
    <section
      id="categories"
      className="categories"
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="categories-heading">

        <span className="categories-eyebrow">
          <i className="bi bi-grid"></i>
          Explore Opportunities
        </span>

        <h2>
          Find jobs by
          <span> category</span>
        </h2>

        <p>
          Explore thousands of opportunities across
          different industries and find the career path
          that's right for you.
        </p>

      </div>


      {/* =====================================================
          CATEGORY GRID
      ===================================================== */}

      <div className="category-grid">

        {categories.map((item, index) => (

          <div
            className="category-card"
            key={index}
          >

            {/* Card top */}

            <div className="category-card-top">

              <div className="category-icon">
                <i className={item.icon}></i>
              </div>

              <span className="category-number">
                {String(index + 1).padStart(2, "0")}
              </span>

            </div>


            {/* Content */}

            <div className="category-content">

              <h3>
                {item.title}
              </h3>

              <p>
                <i className="bi bi-briefcase"></i>
                {item.jobs}
              </p>

            </div>


            {/* Explore */}

            <button
              type="button"
              className="explore-btn"
              onClick={() => navigate("/login")}
            >

              <span>
                Explore Jobs
              </span>

              <i className="bi bi-arrow-up-right"></i>

            </button>

          </div>

        ))}

      </div>


      {/* =====================================================
          BOTTOM NOTE
      ===================================================== */}

      <div className="categories-footer">

        <div className="categories-footer-icon">
          <i className="bi bi-search"></i>
        </div>

        <p>
          Can't find what you're looking for?
          <strong>
            Explore all available jobs
          </strong>
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
        >
          View All Jobs
          <i className="bi bi-arrow-right"></i>
        </button>

      </div>

    </section>
  );
}

export default Categories;