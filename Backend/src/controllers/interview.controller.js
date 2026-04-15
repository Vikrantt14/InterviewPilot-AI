const {generteInterviewReport, generateResumePdf} = require("../services/ai.service");

// 🔥 SAFE IMPORT (handles both CommonJS & ESM issues)
const pdfParseLib = require("pdf-parse");
const pdfParse = pdfParseLib.default || pdfParseLib;

const InterviewReportModel = require("../models/report.model");

function formatReportTitle(jobDescription) {
  const text = String(jobDescription || "").trim();
  if (!text) return "Interview Report";

  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || text;
  const normalized = firstLine.replace(/^Job Description[:\s]*/i, "").trim();
  const shortTitle = normalized.length > 45 ? `${normalized.slice(0, 45).trim()}...` : normalized;

  return `Interview Report for ${shortTitle}`;
}

/**
 * @description controller to generate interview report
 */
// async function generateInterviewController(req, res) {
//   try {
//     // ✅ Check file
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume file is required"
//       });
//     }

//     // ✅ Allow only PDF
//     if (req.file.mimetype !== "application/pdf") {
//       return res.status(400).json({
//         success: false,
//         message: "Only PDF files are allowed"
//       });
//     }

//     const resumeBuffer = req.file.buffer;

//     // 🔍 Debug (remove later)
//     console.log("pdfParse type:", typeof pdfParse);

//     // ✅ Parse PDF
//     const resumeContent = await pdfParse(resumeBuffer);

//     if (!resumeContent || !resumeContent.text) {
//       throw new Error("Failed to extract text from PDF");
//     }

//     const { selfDescription, jobDescription } = req.body;

//     // ✅ AI Call
//  const interviewReportByAi = await generteInterviewReport({
//   resume: resumeContent.text,
//   selfDescription,
//   jobDescription
// });
//     if (!interviewReportByAi.isAIGenerated) {
//   console.log("⚠️ Using MOCK data instead of AI");
// }
// // ✅ SAFE FALLBACK (important)
// const safeReport = {
//   matchScore: interviewReportByAi?.matchScore || 0,
//   technicalQuestions: interviewReportByAi?.technicalQuestions || [],
//   behavioralQuestions: interviewReportByAi?.behavioralQuestions || [],
//   skillGaps: interviewReportByAi?.skillGaps || [],
//   preparationPlans: interviewReportByAi?.preparationPlans || [],
//   isAIGenerated: interviewReportByAi?.isAIGenerated || false
// };

// console.log("FINAL DATA TO SAVE 👉", safeReport);


// // ✅ Save to DB
// const interviewReport = await InterviewReportModel.create({
//   user: req.user?.id || null,  // prevent crash if user missing
//   resume: resumeContent.text,
//   selfDescription,
//   jobDescription,
//   title: jobDescription || "Interview Report",
//   ...safeReport
// });
//   // ✅ Response
// res.status(201).json({
//   success: true,
//   message: safeReport.isAIGenerated
//     ? "AI report generated successfully"
//     : "Mock report generated (AI failed)",
//   interviewReport
// });

//   } catch (error) {
//     console.error("Error generating interview report:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to generate interview report",
//       error: error.message
//     });
//   }
// }





async function generateInterviewController(req, res) {
  try {
    // ✅ File validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required"
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed"
      });
    }

    const resumeBuffer = req.file.buffer;

    // ✅ Parse PDF
    const resumeContent = await pdfParse(resumeBuffer);

    if (!resumeContent?.text) {
      throw new Error("Failed to extract text from PDF");
    }

    const { selfDescription, jobDescription } = req.body;

    // ✅ AI Call
    const interviewReportByAi = await generteInterviewReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription
    });

    console.log("AI RAW 👉", interviewReportByAi);

    // ✅ SAFE DATA STRUCTURE
    const safeReport = {
      title: interviewReportByAi?.title?.trim() || formatReportTitle(jobDescription),
      matchScore: interviewReportByAi?.matchScore || 0,
      technicalQuestions: Array.isArray(interviewReportByAi?.technicalQuestions)
        ? interviewReportByAi.technicalQuestions
        : [],
      behavioralQuestions: Array.isArray(interviewReportByAi?.behavioralQuestions)
        ? interviewReportByAi.behavioralQuestions
        : [],
      skillGaps: Array.isArray(interviewReportByAi?.skillGaps)
        ? interviewReportByAi.skillGaps
        : [],
      preparationPlans: Array.isArray(interviewReportByAi?.preparationPlans)
        ? interviewReportByAi.preparationPlans
        : [],
      isAIGenerated: interviewReportByAi?.isAIGenerated || false
    };

    console.log("FINAL DATA 👉", safeReport);

    // ✅ CRITICAL FIX: ensure user exists
    if (!req.user || !req.user.id) {
      console.log("⚠️ No user found, saving without user");
    }

    // ✅ SAVE (WITH TRY-CATCH)
    let interviewReport;

    try {
      interviewReport = await InterviewReportModel.create({
        user: req.user?.id || undefined,  // 🔥 IMPORTANT FIX
        resume: resumeContent.text,
        selfDescription,
        jobDescription,

        ...safeReport
      });

      console.log("✅ SAVED TO DB 👉", interviewReport._id);

    } catch (dbError) {
      console.error("❌ DB SAVE ERROR 👉", dbError);
      throw new Error("Database save failed: " + dbError.message);
    }

    // ✅ RESPONSE
    res.status(201).json({
      success: true,
      message: safeReport.isAIGenerated
        ? "AI report generated successfully"
        : "Mock report generated (AI fallback)",
      interviewReport
    });

  } catch (error) {
    console.error("❌ FINAL ERROR 👉", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate interview report",
      error: error.message
    });
  }
}









/**
 * @description get interview report by ID
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    // ❌ WRONG (your old code)
    // findById({_id: interviewId, user: req.user.id})

    // ✅ CORRECT
    const interviewReport = await InterviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found"
      });
    }

    res.status(200).json({
      message: "Interview report found",
      interviewReport
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching interview report",
      error: error.message
    });
  }
}

/**
 * @description get all interview reports of logged-in user
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await InterviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      // .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlans");

    res.status(200).json({
      message: "Interview reports found",
      interviewReports
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching interview reports",
      error: error.message
    });
  }
  console.log(pdfParse);
}


/**
 * @description controller to generate resume pdf based on user self description, resue and job description
 */

// async function generateResumePdfController(req, res) {
//        const {interviewReportId} = req.params;

//       const interviewReport = await InterviewReportModel.findById(interviewReportId);

//       if (!interviewReport) { 
//         return res.status(404).json({
//           message: "Interview report not found"
//         });
//       }
//       const { resume, selfDescription, jobDescription } = interviewReport;

//       const pdfBuffer = await generateResumePdf({
//         resume,
//         selfDescription,
//         jobDescription
//       });

//       res.set({
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
//       }); 
//       res.send(pdfBuffer);

// }



async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await InterviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found"
      });
    }

    const { resume, selfDescription, jobDescription } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume,
      selfDescription,
      jobDescription
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate resume PDF"
    });
  }
}



module.exports = {
  generateInterviewController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController
};