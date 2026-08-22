import React, { useEffect, useState } from "react";

import {
  FaFileAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCode,
  FaDownload,
  FaEdit,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";

import "./MyResume.css";

const API_URL = "http://localhost:5000";

function MyResume() {
  const [resume, setResume] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  });

  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const getLoggedInUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      return {};
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      setMessage("");

      const user = getLoggedInUser();
      const email = user.email || "";

      if (!email) {
        throw new Error(
          "Logged-in user email not found. Please login again."
        );
      }

      console.log("Fetching resume for:", email);

      const response = await fetch(
        `${API_URL}/api/jobseeker/resume?email=${encodeURIComponent(
          email
        )}`
      );

      const data = await response.json();

      console.log("Resume API response:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to load resume"
        );
      }

      if (data.resume) {
        setResume({
          name:
            data.resume.name ||
            user.fullname ||
            user.name ||
            "",

          role: data.resume.role || "",

          email:
            data.resume.email ||
            email,

          phone:
            data.resume.phone ||
            user.phone ||
            "",

          location:
            data.resume.location ||
            "",

          summary:
            data.resume.summary ||
            "",
        });

        setSkills(
          Array.isArray(data.resume.skills)
            ? data.resume.skills
            : []
        );
      } else {
        setResume({
          name:
            user.fullname ||
            user.name ||
            "",

          role: "",

          email,

          phone:
            user.phone ||
            "",

          location: "",

          summary: "",
        });

        setSkills([]);
      }

      setExperience(
        Array.isArray(data.experience)
          ? data.experience
          : []
      );

      setEducation(
        Array.isArray(data.education)
          ? data.education
          : []
      );
    } catch (error) {
      console.error(
        "Fetch Resume Error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load resume"
      );
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async () => {
    try {
      setSaving(true);
      setMessage("");

      const user = getLoggedInUser();
      const email = user.email || "";

      if (!email) {
        throw new Error(
          "Logged-in user email not found. Please login again."
        );
      }

      const payload = {
        email,

        name: resume.name,
        role: resume.role,
        phone: resume.phone,
        location: resume.location,
        summary: resume.summary,

        skills,

        experience,

        education,
      };

      console.log(
        "Saving resume:",
        payload
      );
      const response = await fetch(
        `${API_URL}/api/jobseeker/resume`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      console.log(
        "Save Resume API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to save resume"
        );
      }

      setMessage(
        "Resume saved successfully"
      );

      setEditing(false);

      // Reload saved data
      await fetchResume();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Save Resume Error:",
        error
      );

      setMessage(
        error.message ||
          "Failed to save resume"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditButton = () => {
    if (editing) {
      saveResume();
    } else {
      setEditing(true);
    }
  };

  const updateResumeField = (
    field,
    value
  ) => {
    setResume((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      role: "",
      company: "",
      duration: "",
      description: "",
    };

    setExperience((previous) => [
      ...previous,
      newExperience,
    ]);
  };

  const removeExperience = (id) => {
    setExperience((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  };

  const updateExperience = (
    id,
    field,
    value
  ) => {
    setExperience((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: "",
      institution: "",
      year: "",
    };

    setEducation((previous) => [
      ...previous,
      newEducation,
    ]);
  };

  const removeEducation = (id) => {
    setEducation((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  };

  const updateEducation = (
    id,
    field,
    value
  ) => {
    setEducation((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };


  const addSkill = () => {
    const skill =
      window.prompt(
        "Enter skill:"
      );

    if (
      !skill ||
      !skill.trim()
    ) {
      return;
    }

    setSkills((previous) => [
      ...previous,
      skill.trim(),
    ]);
  };

  const removeSkill = (index) => {
    setSkills((previous) =>
      previous.filter(
        (_, skillIndex) =>
          skillIndex !== index
      )
    );
  };

  const downloadResume = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="resume-page">
        <div className="resume-loading">
          Loading resume...
        </div>
      </div>
    );
  }

  return (
    <div className="resume-page">

      <div className="resume-header">

        <div>
          <div className="resume-title-row">

            <div className="resume-title-icon">
              <FaFileAlt />
            </div>

            <div>
              <h1>
                My Resume
              </h1>

              <p>
                Build and manage your
                professional resume
              </p>
            </div>

          </div>
        </div>

        <div className="resume-header-actions">

          <button
            className="resume-edit-btn"
            onClick={
              handleEditButton
            }
            disabled={saving}
            type="button"
          >
            <FaEdit />

            {saving
              ? "Saving..."
              : editing
              ? "Save Resume"
              : "Edit Resume"}
          </button>

          <button
            className="resume-download-btn"
            onClick={
              downloadResume
            }
            type="button"
          >
            <FaDownload />
            Download
          </button>

        </div>

      </div>

      {message && (
        <div
          className={
            message.includes(
              "successfully"
            )
              ? "resume-success-message"
              : "resume-error-message"
          }
        >
          {message}
        </div>
      )}

      <div className="resume-container">


        <section className="resume-profile">

          <div className="resume-avatar">
            {resume.name
              ? resume.name
                  .charAt(0)
                  .toUpperCase()
              : "Y"}
          </div>

          <div className="resume-profile-content">

            {editing ? (
              <input
                className="resume-name-input"
                value={
                  resume.name
                }
                onChange={(e) =>
                  updateResumeField(
                    "name",
                    e.target.value
                  )
                }
                placeholder="Your name"
              />
            ) : (
              <h2>
                {resume.name ||
                  "Your Name"}
              </h2>
            )}

            {editing ? (
              <input
                className="resume-role-input"
                value={
                  resume.role
                }
                onChange={(e) =>
                  updateResumeField(
                    "role",
                    e.target.value
                  )
                }
                placeholder="Job role"
              />
            ) : (
              <h3>
                {resume.role ||
                  "Job Role"}
              </h3>
            )}

            <div className="resume-contact">

              <span>
                <FaEnvelope />
                {resume.email ||
                  "Email"}
              </span>

              {editing ? (
                <input
                  className="resume-contact-input"
                  value={
                    resume.phone
                  }
                  onChange={(e) =>
                    updateResumeField(
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="Phone number"
                />
              ) : (
                <span>
                  <FaPhone />
                  {resume.phone ||
                    "Phone number"}
                </span>
              )}

              {editing ? (
                <input
                  className="resume-contact-input"
                  value={
                    resume.location
                  }
                  onChange={(e) =>
                    updateResumeField(
                      "location",
                      e.target.value
                    )
                  }
                  placeholder="Location"
                />
              ) : (
                <span>
                  <FaMapMarkerAlt />
                  {resume.location ||
                    "Location"}
                </span>
              )}

            </div>

          </div>

          <div className="resume-status">
            <FaCheckCircle />
            Resume Active
          </div>

        </section>

        <section className="resume-section">

          <div className="section-heading">

            <div className="section-heading-left">

              <div className="section-icon">
                <FaUser />
              </div>

              <div>
                <h2>
                  Professional Summary
                </h2>

                <p>
                  Introduce yourself
                  to employers
                </p>
              </div>

            </div>

            <FaEdit className="section-edit-icon" />

          </div>

          {editing ? (
            <textarea
              className="resume-summary-input"
              value={
                resume.summary
              }
              onChange={(e) =>
                updateResumeField(
                  "summary",
                  e.target.value
                )
              }
              placeholder="Write your professional summary"
            />
          ) : (
            <p className="resume-summary">
              {resume.summary ||
                "No professional summary added."}
            </p>
          )}

        </section>

        <section className="resume-section">

          <div className="section-heading">

            <div className="section-heading-left">

              <div className="section-icon">
                <FaBriefcase />
              </div>

              <div>
                <h2>
                  Work Experience
                </h2>

                <p>
                  Your professional
                  experience
                </p>
              </div>

            </div>

            {editing && (
              <button
                className="add-section-btn"
                onClick={
                  addExperience
                }
                type="button"
              >
                <FaPlus />
                Add Experience
              </button>
            )}

          </div>

          <div className="experience-list">

            {experience.length === 0 ? (
              <p>
                No work experience
                added.
              </p>
            ) : (
              experience.map(
                (item) => (

                  <div
                    className="experience-item"
                    key={item.id}
                  >

                    <div className="experience-icon">
                      <FaBriefcase />
                    </div>

                    <div className="experience-content">

                      {editing ? (
                        <>

                          <input
                            value={
                              item.role ||
                              ""
                            }
                            onChange={(e) =>
                              updateExperience(
                                item.id,
                                "role",
                                e.target.value
                              )
                            }
                            className="resume-edit-input"
                            placeholder="Job role"
                          />

                          <input
                            value={
                              item.company ||
                              ""
                            }
                            onChange={(e) =>
                              updateExperience(
                                item.id,
                                "company",
                                e.target.value
                              )
                            }
                            className="resume-edit-input"
                            placeholder="Company"
                          />

                          <input
                            value={
                              item.duration ||
                              ""
                            }
                            onChange={(e) =>
                              updateExperience(
                                item.id,
                                "duration",
                                e.target.value
                              )
                            }
                            className="resume-edit-input"
                            placeholder="Duration"
                          />

                          <textarea
                            value={
                              item.description ||
                              ""
                            }
                            onChange={(e) =>
                              updateExperience(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="resume-edit-textarea"
                            placeholder="Description"
                          />

                          <button
                            className="delete-btn"
                            onClick={() =>
                              removeExperience(
                                item.id
                              )
                            }
                            type="button"
                          >
                            <FaTrash />
                            Remove
                          </button>

                        </>
                      ) : (
                        <>

                          <div className="experience-top">

                            <div>

                              <h3>
                                {item.role ||
                                  "Job Role"}
                              </h3>

                              <h4>
                                {item.company ||
                                  "Company"}
                              </h4>

                            </div>

                            <span className="experience-date">
                              <FaCalendarAlt />
                              {item.duration ||
                                "Duration"}
                            </span>

                          </div>

                          <p>
                            {item.description ||
                              "No description added."}
                          </p>

                        </>
                      )}

                    </div>

                  </div>

                )
              )
            )}

          </div>

        </section>

        <section className="resume-section">

          <div className="section-heading">

            <div className="section-heading-left">

              <div className="section-icon">
                <FaGraduationCap />
              </div>

              <div>
                <h2>
                  Education
                </h2>

                <p>
                  Your academic
                  background
                </p>
              </div>

            </div>

            {editing && (
              <button
                className="add-section-btn"
                onClick={
                  addEducation
                }
                type="button"
              >
                <FaPlus />
                Add Education
              </button>
            )}

          </div>

          <div className="education-list">

            {education.length === 0 ? (
              <p>
                No education added.
              </p>
            ) : (
              education.map(
                (item) => (

                  <div
                    className="education-item"
                    key={item.id}
                  >

                    <div className="education-icon">
                      <FaGraduationCap />
                    </div>

                    <div className="education-content">

                      {editing ? (
                        <>

                          <input
                            value={
                              item.degree ||
                              ""
                            }
                            onChange={(e) =>
                              updateEducation(
                                item.id,
                                "degree",
                                e.target.value
                              )
                            }
                            className="resume-edit-input"
                            placeholder="Degree"
                          />

                          <input
                            value={
                              item.institution ||
                              ""
                            }
                            onChange={(e) =>
                              updateEducation(
                                item.id,
                                "institution",
                                e.target.value
                              )
                            }
                            className="resume-edit-input"
                            placeholder="Institution"
                          />

                          <input
                            value={
                              item.year ||
                              ""
                            }
                            onChange={(e) =>
                              updateEducation(
                                item.id,
                                "year",
                                e.target.value
                              )
                            }
                            className="resume-edit-input"
                            placeholder="Year"
                          />

                          <button
                            className="delete-btn"
                            onClick={() =>
                              removeEducation(
                                item.id
                              )
                            }
                            type="button"
                          >
                            <FaTrash />
                            Remove
                          </button>

                        </>
                      ) : (
                        <>

                          <h3>
                            {item.degree ||
                              "Degree"}
                          </h3>

                          <p>
                            {item.institution ||
                              "Institution"}
                          </p>

                          <span>
                            <FaCalendarAlt />
                            {item.year ||
                              "Year"}
                          </span>

                        </>
                      )}

                    </div>

                  </div>

                )
              )
            )}

          </div>

        </section>

        <section className="resume-section">

          <div className="section-heading">

            <div className="section-heading-left">

              <div className="section-icon">
                <FaCode />
              </div>

              <div>
                <h2>
                  Skills
                </h2>

                <p>
                  Technical skills
                  and expertise
                </p>
              </div>

            </div>

            {editing && (
              <button
                className="add-section-btn"
                onClick={addSkill}
                type="button"
              >
                <FaPlus />
                Add Skill
              </button>
            )}

          </div>

          <div className="skills-list">

            {skills.length === 0 ? (
              <p>
                No skills added.
              </p>
            ) : (
              skills.map(
                (skill, index) => (

                  <div
                    className="skill-tag"
                    key={`${skill}-${index}`}
                  >

                    <FaCheckCircle />

                    <span>
                      {skill}
                    </span>

                    {editing && (
                      <FaTrash
                        onClick={() =>
                          removeSkill(
                            index
                          )
                        }
                        style={{
                          cursor:
                            "pointer",
                          marginLeft:
                            "8px",
                        }}
                      />
                    )}

                  </div>

                )
              )
            )}

          </div>

        </section>

        <div className="resume-footer">

          <div>

            <FaFileAlt />

            <span>
              JobPortal Resume
            </span>

          </div>

          <span>
            Last updated:{" "}
            {new Date().toLocaleDateString(
              "en-GB"
            )}
          </span>

        </div>

      </div>
    </div>
  );
}

export default MyResume;