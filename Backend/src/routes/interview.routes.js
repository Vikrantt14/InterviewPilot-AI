const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController= require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router();


/**
 * @router POST /api/interview
 * @description generate new interview report on thr basis of description, resume pdf and job description
 * @access private
*/

  interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewController)

/**
 * @router GET /api/interview/report/:interviewId
 * @description get interview report by interview id
 * @access private
*/

  interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

/**
 * @router GET /api/interview/report
 * @description get all interview reports of logged-in user
 * @access private
*/

  interviewRouter.get("/report", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/** * @router GET /api/interview/resume-pdf/:interviewId
 * @description generate resume pdf based on user self description, resue and job description
 * @access private
*/

  interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)



module.exports = interviewRouter