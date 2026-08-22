import React, { useEffect, useState } from "react";

import {
  FaGraduationCap,
  FaCode,
  FaDatabase,
  FaLaptopCode,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaClock,
  FaQuestionCircle,
  FaTrophy,
  FaPlay,
  FaRedo,
  FaTimes,
} from "react-icons/fa";

import "./SkillAssessment.css";

const API_URL = "http://localhost:5000";

function SkillAssessment() {

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userEmail = user.email || "";

  const [assessments, setAssessments] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingResult, setSavingResult] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [stats, setStats] = useState({
    completed: 0,
    averageScore: 0,
    bestScore: 0,
  });

  const getAssessmentIcon = (type, title) => {
    const text = `${type || ""} ${title || ""}`.toLowerCase();

    if (text.includes("javascript")) {
      return <FaCode />;
    }

    if (text.includes("react")) {
      return <FaLaptopCode />;
    }

    if (
      text.includes("node") ||
      text.includes("database") ||
      text.includes("sql")
    ) {
      return <FaDatabase />;
    }

    return <FaGraduationCap />;
  };

  const fetchAssessments = async () => {
    try {
      setLoadingAssessments(true);
      setErrorMessage("");

      const url = `${API_URL}/api/jobseeker/assessments`;

      console.log("Fetching assessments:", url);

      const response = await fetch(url);

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      console.log("Assessments API response:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Failed to fetch assessments. Status: ${response.status}`
        );
      }

      if (data.success === false) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to fetch assessments."
        );
      }

      const assessmentData = Array.isArray(data.assessments)
        ? data.assessments
        : Array.isArray(data)
        ? data
        : [];

      const formattedAssessments = assessmentData.map((assessment) => ({
        ...assessment,

        icon: getAssessmentIcon(
          assessment.type,
          assessment.title
        ),

        questions: Number(
          assessment.total_questions || 0
        ),

        duration: Number(
          assessment.duration || 0
        ),

        level:
          assessment.difficulty ||
          "Intermediate",

        progress: 0,
      }));

      console.log(
        "Formatted assessments:",
        formattedAssessments
      );

      setAssessments(formattedAssessments);
    } catch (error) {
      console.error(
        "Fetch Assessments Error:",
        error
      );

      setAssessments([]);

      setErrorMessage(
        error.message ||
          "Unable to load assessments."
      );
    } finally {
      setLoadingAssessments(false);
    }
  };

  const fetchStats = async () => {
    if (!userEmail) {
      console.log(
        "No logged-in user email found."
      );
      return;
    }

    try {
      const url =
        `${API_URL}/api/jobseeker/assessment-stats/` +
        encodeURIComponent(userEmail);

      console.log(
        "Fetching assessment stats:",
        url
      );

      const response = await fetch(url);

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid statistics response."
        );
      }

      console.log(
        "Assessment stats response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to fetch assessment statistics."
        );
      }

      setStats({
        completed: Number(
          data.completed || 0
        ),

        averageScore: Number(
          data.averageScore || 0
        ),

        bestScore: Number(
          data.bestScore || 0
        ),
      });
    } catch (error) {
      console.error(
        "Fetch Stats Error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchStats();
  }, []);

  const fetchQuestions = async (
    assessmentId
  ) => {
    try {
      setLoadingQuestions(true);
      setErrorMessage("");
      setQuestions([]);

      const url =
        `${API_URL}/api/jobseeker/assessments/` +
        `${encodeURIComponent(assessmentId)}/questions`;

      console.log(
        "Fetching questions:",
        url
      );

      const response = await fetch(url);

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      console.log(
        "Questions API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Failed to load questions. Status: ${response.status}`
        );
      }

      if (data.success === false) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to load assessment questions."
        );
      }

      const fetchedQuestions =
        Array.isArray(data.questions)
          ? data.questions
          : [];

      const formattedQuestions =
        fetchedQuestions.map((item) => {
          let options = item.options;

          // If backend sends JSON string
          if (typeof options === "string") {
            try {
              options = JSON.parse(options);
            } catch {
              options = [];
            }
          }

          // If backend doesn't send options array
          if (!Array.isArray(options)) {
            options = [
              item.option_a,
              item.option_b,
              item.option_c,
              item.option_d,
            ].filter(
              (option) =>
                option !== null &&
                option !== undefined &&
                String(option).trim() !== ""
            );
          }

          return {
            id: item.id,
            question: item.question,
            options,
            correct_answer:
              item.correct_answer,
          };
        });

      console.log(
        "Formatted questions:",
        formattedQuestions
      );

      if (
        formattedQuestions.length === 0
      ) {
        throw new Error(
          "No questions are available for this assessment."
        );
      }

      setQuestions(
        formattedQuestions
      );

      setCurrentQuestion(0);

      return formattedQuestions;
    } catch (error) {
      console.error(
        "Fetch Questions Error:",
        error
      );

      setQuestions([]);

      setErrorMessage(
        error.message ||
          "Unable to load assessment questions."
      );

      return [];
    } finally {
      setLoadingQuestions(false);
    }
  };

  const startAssessment = async (
    assessment
  ) => {
    setSelectedTest(assessment);

    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setScore(0);

    setSaveMessage("");
    setErrorMessage("");
    setQuestions([]);

    const duration =
      Number(assessment.duration) || 20;

    setTimeLeft(duration * 60);

    await fetchQuestions(
      assessment.id
    );
  };

  const closeAssessment = () => {
    setSelectedTest(null);

    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});

    setSubmitted(false);
    setScore(0);
    setTimeLeft(0);

    setSaveMessage("");
    setErrorMessage("");

    setLoadingQuestions(false);
  };

  const saveAssessmentResult = async (
    assessment,
    finalScore
  ) => {
    try {
      setSavingResult(true);
      setSaveMessage("");

      const loggedInUser =
        JSON.parse(
          localStorage.getItem("user")
        ) || {};

      const email =
        loggedInUser.email;

      if (!email) {
        throw new Error(
          "Logged-in user email is not available."
        );
      }

      const payload = {
        email: email,
        assessment_id: assessment.id,
        score: finalScore,
      };

      console.log(
        "Saving assessment result:",
        payload
      );

      const response = await fetch(
        `${API_URL}/api/jobseeker/assessment-results`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response from result API."
        );
      }

      console.log(
        "Assessment result response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to save assessment result."
        );
      }

      setSaveMessage(
        "Assessment result saved successfully."
      );

      await fetchStats();
    } catch (error) {
      console.error(
        "Save Assessment Result Error:",
        error
      );

      setSaveMessage(
        error.message ||
          "Failed to save assessment result."
      );
    } finally {
      setSavingResult(false);
    }
  };

  useEffect(() => {
    if (
      !selectedTest ||
      submitted ||
      loadingQuestions ||
      questions.length === 0
    ) {
      return;
    }

    if (timeLeft <= 0) {
      submitAssessment();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (previous) =>
          previous > 0
            ? previous - 1
            : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    selectedTest,
    submitted,
    loadingQuestions,
    questions.length,
    timeLeft,
  ]);

  const formatTime = () => {
    const minutes = Math.floor(
      timeLeft / 60
    );

    const seconds =
      timeLeft % 60;

    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  const selectAnswer = (
    answer
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: answer,
    }));
  };

  const nextQuestion = () => {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      );
    }
  };

  

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) =>
          previous - 1
      );
    }
  };

  const submitAssessment =
    async () => {
      if (
        !selectedTest ||
        submitted ||
        questions.length === 0
      ) {
        return;
      }

      let correctAnswers = 0;

      questions.forEach(
        (question, index) => {
          const selectedAnswer =
            answers[index];

          const correctAnswer =
            question.correct_answer;

          if (
            selectedAnswer !== undefined &&
            correctAnswer !== undefined &&
            String(
              selectedAnswer
            ).trim() ===
              String(
                correctAnswer
              ).trim()
          ) {
            correctAnswers++;
          }
        }
      );

      const finalScore =
        Math.round(
          (correctAnswers /
            questions.length) *
            100
        );

      console.log(
        "Correct answers:",
        correctAnswers
      );

      console.log(
        "Total questions:",
        questions.length
      );

      console.log(
        "Final score:",
        finalScore
      );

      setScore(finalScore);
      setSubmitted(true);

      await saveAssessmentResult(
        selectedTest,
        finalScore
      );
    };

  const retakeAssessment =
    async () => {
      if (!selectedTest) {
        return;
      }

      setCurrentQuestion(0);
      setAnswers({});
      setScore(0);
      setSubmitted(false);

      setSaveMessage("");
      setErrorMessage("");
      setQuestions([]);

      const duration =
        Number(
          selectedTest.duration
        ) || 20;

      setTimeLeft(
        duration * 60
      );

      await fetchQuestions(
        selectedTest.id
      );
    };

  const getScoreMessage =
    () => {
      if (score >= 80) {
        return "Excellent! You have a strong understanding of this topic.";
      }

      if (score >= 60) {
        return "Good job! Keep practicing to improve your score.";
      }

      return "Keep learning and practicing. You can improve your score!";
    };

  const currentQuestionData =
    questions[
      currentQuestion
    ];

  const totalTime =
    assessments.reduce(
      (total, assessment) =>
        total +
        Number(
          assessment.duration || 0
        ),
      0
    );

  if (loadingAssessments) {
    return (
      <div className="skill-page">
        <div className="assessment-loading">
          <div className="loading-spinner"></div>

          <h2>
            Loading Assessments...
          </h2>

          <p>
            Please wait while we
            load available tests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-page">

      <div className="skill-page-header">

        <div className="skill-header-left">

          <div className="skill-header-icon">
            <FaGraduationCap />
          </div>

          <div>
            <h1>
              Skill Assessment
            </h1>

            <p>
              Test your skills and
              improve your career
              opportunities
            </p>
          </div>

        </div>

        <div className="skill-score-card">

          <div className="score-icon">
            <FaTrophy />
          </div>

          <div>
            <span>
              Your Best Score
            </span>

            <strong>
              {stats.bestScore}%
            </strong>
          </div>

        </div>

      </div>

      <div className="skill-stats">

        <div className="skill-stat-card">

          <div className="stat-icon green">
            <FaCheckCircle />
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {stats.completed}
            </strong>
          </div>

        </div>

        <div className="skill-stat-card">

          <div className="stat-icon blue">
            <FaQuestionCircle />
          </div>

          <div>
            <span>
              Available Tests
            </span>

            <strong>
              {assessments.length}
            </strong>
          </div>

        </div>

        <div className="skill-stat-card">

          <div className="stat-icon orange">
            <FaClock />
          </div>

          <div>
            <span>
              Total Time
            </span>

            <strong>
              {totalTime} min
            </strong>
          </div>

        </div>

        <div className="skill-stat-card">

          <div className="stat-icon purple">
            <FaTrophy />
          </div>

          <div>
            <span>
              Average Score
            </span>

            <strong>
              {stats.averageScore}%
            </strong>
          </div>

        </div>

      </div>

      {errorMessage &&
        !selectedTest && (
          <div className="assessment-error">

            <div className="error-icon">
              <FaTimes />
            </div>

            <h2>
              Unable to Load Assessments
            </h2>

            <p>
              {errorMessage}
            </p>

            <button
              className="start-test-btn"
              type="button"
              onClick={
                fetchAssessments
              }
            >
              Try Again
            </button>

          </div>
        )}

      <div className="assessment-section-header">

        <div>
          <h2>
            Available Assessments
          </h2>

          <p>
            Choose a test and
            evaluate your technical
            skills
          </p>
        </div>

        <span className="assessment-count">
          {assessments.length}{" "}
          Assessments
        </span>

      </div>

      <div className="assessment-grid">

        {assessments.map(
          (assessment) => (

            <div
              className="assessment-card"
              key={assessment.id}
            >

              <div className="assessment-card-top">

                <div className="assessment-icon">
                  {assessment.icon}
                </div>

                <span
                  className={`level-badge ${String(
                    assessment.level
                  )
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    )}`}
                >
                  {assessment.level}
                </span>

              </div>

              <div className="assessment-content">

                <h3>
                  {assessment.title}
                </h3>

                <p>
                  {assessment.description ||
                    "Test your technical skills with this assessment."}
                </p>

                <div className="assessment-info">

                  <span>
                    <FaQuestionCircle />

                    {
                      assessment.questions
                    }{" "}
                    Questions
                  </span>

                  <span>
                    <FaClock />

                    {
                      assessment.duration
                    }{" "}
                    min
                  </span>

                </div>

              </div>

              <div className="assessment-actions">

                <button
                  className="start-test-btn"
                  type="button"
                  onClick={() =>
                    startAssessment(
                      assessment
                    )
                  }
                >
                  <FaPlay />

                  Start Assessment

                  <FaArrowRight />
                </button>

              </div>

            </div>
          )
        )}

      </div>


      {assessments.length === 0 &&
        !errorMessage && (
          <div className="no-assessments">

            <FaQuestionCircle />

            <h3>
              No assessments available
            </h3>

            <p>
              Assessments will appear
              here when they are added
              by the administrator.
            </p>

          </div>
        )}

      <div className="skill-tips">

        <div className="tips-icon">
          <FaTrophy />
        </div>

        <div>

          <h3>
            Improve Your Profile
          </h3>

          <p>
            Completing skill
            assessments helps
            employers understand
            your technical
            abilities and can
            improve your chances
            of getting shortlisted.
          </p>

        </div>

      </div>

      {selectedTest && (

        <div className="assessment-modal-overlay">

          <div className="assessment-modal">

            <button
              className="modal-close"
              type="button"
              onClick={
                closeAssessment
              }
              title="Close"
            >
              <FaTimes />
            </button>


            {loadingQuestions ? (

              <div className="assessment-loading">

                <div className="loading-spinner"></div>

                <h2>
                  Loading Assessment...
                </h2>

                <p>
                  Please wait while we
                  load your questions.
                </p>

              </div>

            ) : errorMessage ? (

              <div className="assessment-error">

                <div className="error-icon">
                  <FaTimes />
                </div>

                <h2>
                  Unable to Load
                  Assessment
                </h2>

                <p>
                  {errorMessage}
                </p>

                <button
                  className="start-test-btn"
                  type="button"
                  onClick={() =>
                    fetchQuestions(
                      selectedTest.id
                    )
                  }
                >
                  Try Again
                </button>

              </div>

            ) : submitted ? (

              <div className="assessment-result">

                <div className="result-trophy">
                  <FaTrophy />
                </div>

                <h2>
                  Assessment Completed!
                </h2>

                <p>
                  {selectedTest.title}
                </p>

                <div className="result-score">
                  {score}%
                </div>

                <h3>
                  {getScoreMessage()}
                </h3>

                <div className="result-details">

                  <div>
                    <span>
                      Questions
                    </span>

                    <strong>
                      {questions.length}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Answered
                    </span>

                    <strong>
                      {
                        Object.keys(
                          answers
                        ).length
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Score
                    </span>

                    <strong>
                      {score}%
                    </strong>
                  </div>

                </div>

                {savingResult && (
                  <p
                    style={{
                      color: "#666",
                      marginTop:
                        "15px",
                    }}
                  >
                    Saving your
                    assessment
                    result...
                  </p>
                )}

                {saveMessage && (
                  <p
                    style={{
                      color:
                        saveMessage.includes(
                          "successfully"
                        )
                          ? "#16a34a"
                          : "#dc2626",
                      marginTop:
                        "15px",
                      fontWeight:
                        "600",
                    }}
                  >
                    {saveMessage}
                  </p>
                )}

                <div className="result-actions">

                  <button
                    className="retake-btn"
                    type="button"
                    onClick={
                      retakeAssessment
                    }
                    disabled={
                      savingResult
                    }
                  >
                    <FaRedo />
                    Retake Test
                  </button>

                  <button
                    className="start-test-btn"
                    type="button"
                    onClick={
                      closeAssessment
                    }
                  >
                    <FaCheckCircle />
                    Finish
                  </button>

                </div>

              </div>

            ) : (

              <>
                {currentQuestionData && (

                  <>

                    <div className="test-header">

                      <div>

                        <div className="modal-icon">
                          {
                            selectedTest.icon
                          }
                        </div>

                        <h2>
                          {
                            selectedTest.title
                          }
                        </h2>

                      </div>

                      <div className="test-timer">

                        <FaClock />

                        <strong>
                          {formatTime()}
                        </strong>

                      </div>

                    </div>

                    <div className="question-progress">

                      <div className="question-progress-text">

                        <span>
                          Question{" "}
                          {currentQuestion +
                            1}{" "}
                          of{" "}
                          {
                            questions.length
                          }
                        </span>

                        <strong>
                          {Math.round(
                            ((currentQuestion +
                              1) /
                              questions.length) *
                              100
                          )}
                          %
                        </strong>

                      </div>

                      <div className="progress-bar">

                        <div
                          style={{
                            width: `${
                              ((currentQuestion +
                                1) /
                                questions.length) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="question-container">

                      <span className="question-number">
                        Question{" "}
                        {currentQuestion +
                          1}
                      </span>

                      <h3>
                        {
                          currentQuestionData.question
                        }
                      </h3>

                      <div className="question-options">

                        {currentQuestionData.options.map(
                          (
                            option,
                            index
                          ) => (

                            <button
                              key={index}
                              type="button"
                              className={
                                answers[
                                  currentQuestion
                                ] ===
                                option
                                  ? "question-option selected"
                                  : "question-option"
                              }
                              onClick={() =>
                                selectAnswer(
                                  option
                                )
                              }
                            >

                              <span className="option-letter">
                                {String.fromCharCode(
                                  65 +
                                    index
                                )}
                              </span>

                              <span>
                                {option}
                              </span>

                              {answers[
                                currentQuestion
                              ] ===
                                option && (
                                <FaCheckCircle className="answer-check" />
                              )}

                            </button>

                          )
                        )}

                      </div>

                    </div>

                    <div className="question-navigation">

                      <button
                        className="previous-question-btn"
                        type="button"
                        onClick={
                          previousQuestion
                        }
                        disabled={
                          currentQuestion ===
                          0
                        }
                      >
                        <FaArrowLeft />
                        Previous
                      </button>

                      {currentQuestion ===
                      questions.length -
                        1 ? (

                        <button
                          className="submit-test-btn"
                          type="button"
                          onClick={
                            submitAssessment
                          }
                          disabled={
                            savingResult
                          }
                        >
                          <FaCheckCircle />
                          Submit Assessment
                        </button>

                      ) : (

                        <button
                          className="next-question-btn"
                          type="button"
                          onClick={
                            nextQuestion
                          }
                        >
                          Next
                          <FaArrowRight />
                        </button>

                      )}

                    </div>

                  </>

                )}

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default SkillAssessment;