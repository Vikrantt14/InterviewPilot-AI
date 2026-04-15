import React, { useState, useEffect } from "react";
import "../style/interview.scss";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, Lightbulb, CheckCircle, Code, MessageSquare, GitBranch, LogOut } from "lucide-react";
import { useInterview } from "../hooks/use.interview.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import Swal from "sweetalert2";

const Interview = () => {
  const [activeSection, setActiveSection] = useState("technical");
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [error, setError] = useState("");
  const { report, loading, getReportById } = useInterview();
  const { user, handleLogout } = useAuth();
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const confirmLogout = async () => {
    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await handleLogout();
      navigate("/login");
    }
  };

useEffect(() => {
  if (!interviewId) return;

  getReportById(interviewId)
    .then(data => {
      if (!data) {
        setError("Interview report not found.");
      }
    })
    .catch(() => {
      setError("Failed to fetch report");
    });

}, [interviewId]);
  // Use actual data from context, fallback to empty structure if no report
  const data = report || {
    matchScore: 0,
    preparationPlans: [],
    technicalQuestions: [],
    behavioralQuestions: [],
    skillGaps: [],
  };

  const currentQuestions =
    activeSection === "technical"
      ? data.technicalQuestions || []
      : data.behavioralQuestions || [];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "yellow";
      default:
        return "green";
    }
  };

  const getScoreColor = () => {
    return data.matchScore >= 75 ? "green" : "red";
  };

  return (
    <div className="interview-dashboard">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading interview report...</p>
        </div>
      ) : error ? (
        <div className="no-data-container">
          <div className="no-data-message">
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        </div>
      ) : !report ? (
        <div className="no-data-container">
          <div className="no-data-message">
            <h2>No Interview Report Available</h2>
            <p>Please generate an interview report first from the home page.</p>
          </div>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Sidebar */}
      <div className="sidebar">
        {/* User Profile Section */}
        <div className="user-profile">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-info">
            <h4 className="user-name">{user?.username || "User"}</h4>
            <p className="user-email">{user?.email || "email@example.com"}</p>
          </div>
        </div>

        <h3 className="sidebar-title">SECTIONS</h3>

        <div className="menu">
          <div
            className={`menu-item ${activeSection === "technical" ? "active" : ""}`}
            onClick={() => setActiveSection("technical")}
          >
            <Code size={16} />
            <span>Technical Questions</span>
          </div>
          <div
            className={`menu-item ${activeSection === "behavioral" ? "active" : ""}`}
            onClick={() => setActiveSection("behavioral")}
          >
            <MessageSquare size={16} />
            <span>Behavioral Questions</span>
          </div>
          <div
            className={`menu-item ${activeSection === "roadmap" ? "active" : ""}`}
            onClick={() => setActiveSection("roadmap")}
          >
            <GitBranch size={16} />
            <span>Road Map</span>
          </div>
        </div>

        <div className="sidebar-actions">
          <button className="profile-button" onClick={() => navigate("/")}>
            <GitBranch size={16} />
            <span>Home</span>
          </button>
          <button className="logout-button" onClick={confirmLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeSection !== "roadmap" ? (
          <>
            <div className="content-header">
             
              <h2>
                {activeSection === "technical" ? "Technical" : "Behavioral"} Questions
              </h2>
              <span className="badge">{currentQuestions.length} questions</span>
            </div>

            <div className="questions-container">
              {currentQuestions.map((q, index) => (
                <div
                  key={q.id || index}
                  className={`question-card ${
                    expandedQuestion === (q.id || index) ? "expanded" : ""
                  }`}
                >
                  <div
                    className="question-header"
                    onClick={() =>
                      setExpandedQuestion(expandedQuestion === (q.id || index) ? null : (q.id || index))
                    }
                  >
                    <span className="qno">Q{index + 1}</span>
                    <p className="question-text">{q.question}</p>
                    <ChevronDown
                      size={20}
                      className={`chevron ${expandedQuestion === (q.id || index) ? "open" : ""}`}
                    />
                  </div>

                  {expandedQuestion === (q.id || index) && (
                    <div className="question-details">
                      <div className="detail-section">
                        <div className="detail-header">
                          <Lightbulb size={16} />
                          <span>INTENTION</span>
                        </div>
                        <p className="detail-text">{q.intention}</p>
                      </div>

                      <div className="detail-section">
                        <div className="detail-header">
                          <CheckCircle size={16} />
                          <span>YOUR ANSWER</span>
                        </div>
                        <textarea
                          className="answer-input"
                          placeholder="Write your answer here..."
                          defaultValue={q.answer}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="content-header">
              <h2>Preparation Road Map</h2>
              <span className="badge">{data.preparationPlans.length}-day plan</span>
            </div>

            <div className="timeline-container">
              {data.preparationPlans.map((plan, index) => (
                <div key={plan.day} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="circle"></div>
                    {index < data.preparationPlans.length - 1 && <div className="line"></div>}
                  </div>
                  <div className="timeline-content">
                    <div className="day-header">
                      <span className="day-badge">Day {plan.day}</span>
                      <h3>{plan.focus}</h3>
                    </div>
                    <ul className="tasks-list">
                      {plan.tasks.map((task, idx) => (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        {/* Score Card */}
        <div className={`score-section ${getScoreColor()}`}>
          <div className={`score-circle ${getScoreColor()}`}>
            <span className="score-text">{data.matchScore}%</span>
          </div>
          <p className="score-label">
            {data.matchScore >= 75 
              ? "Strong match for this role" 
              : "Improvement needed for this role"}
          </p>
        </div>

        {/* Skill Gaps */}
        <div className="skills-section">
          <h4 className="skills-title">SKILL GAPS</h4>
          <div className="skill-tags">
            {data.skillGaps.map((gap, index) => (
              <div
                key={index}
                className={`skill-tag ${getSeverityColor(gap.severity)}`}
              >
                {gap.skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
};

export default Interview;