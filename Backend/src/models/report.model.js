const mongoose = require('mongoose');


/**
 * - self descripton : String
 * - resume text : String
 * - job description : String
 * 
 * - matchhScore : Number 
 * 
 * -- AI
 * 
 * - TECHNINCAL QUES. :
 *      [{
 *         question: "",
 *         intention: "",            
 *         answer: ""
 *      }] 
 * 
 * 
 * - Behavioral ques :
 *        same above
 * 
 * - skill gaps : [{
 *      skill: "",
 *      severtiy : {
 *          type: String,
 *          enum: ["low", "medium", "high"]
 *       }
 * }] 
 * 
 * - prepartion plan : [{
 *          day: number,
 *          focus :String,
 *          tasks: [String]
 *        }]
 * 
 * 
 * 
 * -- STORE IN ARRAY
 * 
 */


const technicalQuestionSchema = new mongoose.Schema({

      question: {
        type: String,
        required: [true, "Technical question is required"]
      },
      intention: {
        type: String,
        required: [true, "Intention is required"]
      },
      answer: {
        type:String,
        required: [true, "Answer is required"]
      }
},{_id:false})

const behavioralQuestionSchema = new mongoose.Schema({

      question: {
        type: String,
        required: [true, "Technical question is required"]
      },
      intention: {
        type: String,
        required: [true, "Intention is required"]
      },
      answer: {
        type:String,
        required: [true, "Answer is required"]
      }
},{_id:false})

const skillGapSchema = new mongoose.Schema({

      skill: {
        type:String,
        required: [true, "Skill is required"]
      },
      severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Severity is required"]
      }
}, {_id:false})

const prepartionPlanSchema = new mongoose.Schema({

      day: {
        type: Number,
        required: [true, "Day is required"]
      },
      focus: {
        type: String,
        required: [true, "Focus is required"]
      },
      tasks: [{
          type:String,
          required: true
      }]
})

const interviewReportSchema = new mongoose.Schema({

    jobDescription : {
      type: String,
      required: [true, "Job description is required"]
    },
    resume : {
      type: String
    },
    selfDescription: {
      type: String,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },

    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlans: [prepartionPlanSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    },
    title: {
      type: String,
      required: [true, "Job title is required"]
    },

}, {timestamps: true})


const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);


module.exports = interviewReportModel
