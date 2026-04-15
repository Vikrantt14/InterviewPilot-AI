import { getAllInterviewReports, generateInterviewReport, getInterviewReportById } from "../services/interview.api";
import { useContext } from "react"
import { InterviewContext } from "../interview.context";
import Swal from "sweetalert2"


export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }
    const { loading, setLoading, report, setReport, reports, setReports } = context



    //     const generateReport = async (resume, selfDescription, jobDescription) => {
    //         try {
    //             setLoading(true)
    //             const response = await generateInterviewReport(resume, selfDescription, jobDescription)
    //          setReport(response.data.interviewReport)
    //             return response.data.interviewReport
    //         } catch (error) {
    //   console.error("Error generating interview report", error)
    //   return null   // ✅ IMPORTANT

    //         } finally {
    //             setLoading(false)
    //         }
    // }


// const generateReport = async (resume, selfDescription, jobDescription) => {
//   try {
//     setLoading(true)

//     const response = await generateInterviewReport(
//       resume,
//       selfDescription,
//       jobDescription
//     )

//     console.log("API RESPONSE 👉", response.data)

//     const reportData = response?.data?.interviewReport   // ✅ FIX

//     if (!reportData || !reportData._id) {
//       throw new Error("Invalid API response")
//     }

//     setReport(reportData)
//     return reportData

//   } catch (error) {
//     console.error("Error generating interview report", error)
//     return null
//   } finally {
//     setLoading(false)
//   }
// }





const generateReport = async (resume, selfDescription, jobDescription) => {
  try {
    setLoading(true)

    const response = await generateInterviewReport(
      resume,
      selfDescription,
      jobDescription
    )

    const reportData = response?.data?.interviewReport

    if (!reportData || !reportData._id) {
      throw new Error("Invalid API response")
    }

    setReport(reportData)
    return reportData

  } catch (error) {
    console.error("Error generating interview report", error)

    // ✅ SHORT USER-FRIENDLY MESSAGE
    let message = "Something went wrong. Please try again."

    if (error?.response?.data?.error?.includes("503") || error?.message?.includes("503")) {
      message = "AI is busy right now. Try again in a moment."
    } else if (error?.message?.includes("validation")) {
      message = "AI failed to generate report. Please retry."
    }

    Swal.fire({
      icon: "error",
      title: "Generation Failed",
      text: message,
      confirmButtonText: "OK"
    }).then(() => {
  window.location.reload()   // 🔥 reload page instantly
})

    return null

  } finally {
    setLoading(false)
  }
}



const getReportById = async (interviewId) => {
  try {
    setLoading(true)

    const response = await getInterviewReportById(interviewId)

    console.log("GET REPORT 👉", response)

    const reportData =
      response?.interviewReport || response   // ✅ flexible

    if (!reportData) {
      throw new Error("Interview report not found")
    }

    setReport(reportData)
    return reportData

  } catch (error) {
    console.error("Error fetching interview report", error)
    return null
  } finally {
    setLoading(false)
  }
}


const getAllReports = async () => {
  try {
    setLoading(true)

    const response = await getAllInterviewReports()

    const reportsData =
      response?.data?.interviewReports ||
      response?.interviewReports ||
      []

    setReports(reportsData)

  } catch (error) {
    console.error("Error fetching interview reports", error)
  } finally {
    setLoading(false)
  }
}
    return {
        loading, report, reports, generateReport, getReportById, getAllReports
    }


}