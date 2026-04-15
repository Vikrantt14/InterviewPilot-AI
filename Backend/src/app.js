const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express();

const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes")

app.use(express.json())
app.use(cookieParser());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://interviewpilot-frontend.onrender.com"
  ],
  credentials: true
}))

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("🚀 InterviewPilot AI Backend is running");
});

// ROUTES
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app;