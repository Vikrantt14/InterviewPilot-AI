import React, { useState, useRef, useEffect } from "react";
import "../style/home.scss";
import {
  Briefcase,
  User,
  UploadCloud,
  Sparkles,
  X,
  File,
  UserCircle
} from "lucide-react";
import { useInterview } from "../hooks/use.interview.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"

const Home = () => {
  const { loading, generateReport, reports, getAllReports } = useInterview()
  const { handleLogout, user } = useAuth()
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState(null)
  const resumeInputRef = useRef()
  const navigate = useNavigate()

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    if (resumeInputRef.current) {
      resumeInputRef.current.value = ""
    }
  }

 

  const handleGenerateReport = async () => {
    try {
      const resumeFile = uploadedFile || resumeInputRef.current?.files?.[0]
      const report = await generateReport(resumeFile, selfDescription, jobDescription)
      if (report && report._id) {
        navigate(`/interview/${report._id}`)
      }
    } catch (error) {
      console.error("Failed to generate report:", error)
    }
  }

  const confirmLogout = async () => {
    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    })

    if (result.isConfirmed) {
      await handleLogout()
      navigate("/login")
    }
  }

  const showProfileDetails = async () => {
    await Swal.fire({
      title: "User Profile",
      html: `
        <strong>Name:</strong> ${user?.username || "Unknown"}<br />
        <strong>Email:</strong> ${user?.email || "Unknown"}
      `,
      icon: "info",
      confirmButtonText: "Close",
    })
  }

  const isFormValid = () => {
    const hasJobDescription = jobDescription.trim().length > 0
    const hasResume = uploadedFile !== null
    const hasSelfDescription = selfDescription.trim().length > 0
    return hasJobDescription && (hasResume || hasSelfDescription)
  }

useEffect(() => {
  getAllReports();
}, []); // ✅ runs only once

  const formatDate = (value) => {
    if (!value) return "Unknown date"
    return new Date(value).toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
  }

  const getReportTitle = (report) => {
    const rawTitle = String(report?.title || report?.jobDescription || "Untitled Report").trim()
    if (rawTitle.length > 45) {
      return `${rawTitle.slice(0, 45).trim()}...`
    }
    return rawTitle
  }

  const getReportSummary = (report) => {
    const text = String(report?.jobDescription || report?.selfDescription || "").trim()
    if (!text) return "No summary available."
    const summary = text.replace(/\s+/g, " ").slice(0, 120)
    return summary.length < text.length ? `${summary.trim()}...` : summary
  }

  return (
    <main className="plan">
      <div className="container">

        {/* HEADER */}
        <div className="header">
          <div>
            <h1>
              Create Your Custom <span>Interview Plan</span>
            </h1>
            <p>
              Let our AI analyze the job requirements and your unique profile to
              build a winning strategy.
            </p>
          </div>

          <div className="header-actions">
            <button type="button" className="profile-button" onClick={showProfileDetails}>
              <UserCircle size={18} />
            </button>
            <button type="button" className="logout-button" onClick={confirmLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">

          {/* LEFT */}
          <div className="card left">
            <div className="card-header">
              <h3>
                <Briefcase size={18} /> Target Job Description
              </h3>
              <span className="badge">REQUIRED</span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
            />

            <span className="char-count">
              {jobDescription.length} / 5000 chars
            </span>
          </div>

          {/* RIGHT */}
          <div className="card right">

            <div className="card-header">
              <h3>
                <User size={18} /> Your Profile
              </h3>
            </div>

            <div className="upload-title">
              Upload Resume <span>BEST RESULTS</span>
            </div>

            {/* Upload Box - Conditional Rendering */}
            {!uploadedFile ? (
              <label className="upload-box">
                <UploadCloud size={28} />
                <p>Click to upload or drag & drop</p>
                <span>PDF or DOCX (Max 5MB)</span>
                <input
                  ref={resumeInputRef}
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.doc"
                />
              </label>
            ) : (
              <div className="file-uploaded">
                <div className="file-info">
                  <File size={24} className="file-icon" />
                  <div className="file-details">
                    <p className="file-name">{uploadedFile.name}</p>
                    <p className="file-size">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="file-actions">
                  {/* <button 
                    type="button"
                    className="btn-change"
                    onClick={handleChangeFile}
                  >
                    Change
                  </button> */}
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={handleClearFile}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            <div className="divider">
              <span>OR</span>
            </div>

            {/* Self Description */}
            <div className="section">
              <h4>Quick Self-Description</h4>
              <textarea
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                placeholder="Briefly describe your experience, key skills, and years of experience..."
              />
            </div>

            <div className="info-box">
              ℹ️ Either a <b>Resume</b> or <b>Self Description</b> is required to
              generate a personalized plan.
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">
          <p>AI-Powered Strategy Generation · Approx 30s</p>
          <button onClick={handleGenerateReport} disabled={loading || !isFormValid()}>
            <Sparkles size={16} /> {loading ? 'Generating...' : 'Generate My Interview Strategy'}
          </button>
        </div>


        {/* Recent Report List */}


        {reports.length > 0 && (
          <section className="recent-reports">
            <div className="recent-header">
              <h3>My Recent Interview Plans</h3>
            </div>

            <div className="report-grid">
              {reports.map((report) => (
                <div
                  key={report._id}
                  role="button"
                  tabIndex={0}
                  className="report-card"
                  onClick={() => report._id && navigate(`/interview/${report._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      report._id && navigate(`/interview/${report._id}`)
                    }
                  }}
                >
                  <div className="report-card-top">
                    <h4>{getReportTitle(report)}</h4>
                    <p>Generated on {formatDate(report.createdAt)}</p>
                  </div>

                  <div className="report-card-bottom">
                    <span>Match Score</span>
                    <strong>{typeof report.matchScore === "number" ? report.matchScore : 0}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}




      </div>
    </main>
  );
};

export default Home;