const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// ✅ GLOBAL cleanJson (FIXED)
function cleanJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      // Remove markdown if present
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch (err) {
      console.error("❌ RAW AI RESPONSE:", text); // 🔥 DEBUG
    }

    throw new Error("Invalid JSON from AI");
  }
}

// ✅ RETRY FUNCTION
async function retryGenerate(fn, retries = 3) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && err.status === 503) {
      console.log("🔁 Retrying due to overload...");
      await new Promise((res) => setTimeout(res, 2000));
      return retryGenerate(fn, retries - 1);
    }
    throw err;
  }
}

// ✅ ZOD SCHEMA
const interviewReportSchema = z.object({
  matchScore: z.number(),

  technicalQuestions: z
    .array(
      z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
      }),
    )
    .length(5),

  behavioralQuestions: z
    .array(
      z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string(),
      }),
    )
    .length(5),

  skillGaps: z
    .array(
      z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"]),
      }),
    )
    .length(5),

  preparationPlans: z
    .array(
      z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string()),
      }),
    )
    .length(7),
  title: z.string(),
});

async function generteInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  try {

    const prompt = `
You are an AI Interview Engine that returns STRICT JSON only.

🚨 CRITICAL RULES:
- Return ONLY valid JSON (no explanation, no markdown)
- Do NOT include placeholders like "candidate should"
- Generate REAL, interview-ready answers
- Personalize answers using the given Resume, Projects, Experience
- Do NOT assume specific technologies unless present in input

--------------------------------------------------

🎯 GOAL:
Analyze the Resume, Job Description, and Self Description.
Then:
1. Evaluate candidate-job match
2. Identify skill gaps
3. Generate realistic interview questions WITH strong answers
4. Create a practical preparation plan

--------------------------------------------------

📊 MATCH SCORE RULES:
- 90–100 → Strong match (most required skills present)
- 75–89 → Good match (minor gaps)
- 60–74 → Moderate (clear gaps)
- <60 → Weak match

Consider:
- Skill overlap with job description
- Project relevance
- Real-world experience (internships, work)
- Depth of technologies used

--------------------------------------------------

🧠 ANSWER GENERATION RULES (VERY IMPORTANT):

Each answer MUST:
- Be written in FIRST PERSON ("I", "my experience")
- Be 4–6 lines minimum
- Include:
  1. Situation / Problem
  2. Action taken
  3. Result / Outcome
- Use REAL data from resume if available
- If no real experience exists, generate a realistic scenario

❌ NEVER:
- "The candidate should..."
- Generic textbook answers

✅ ALWAYS:
- Practical, experience-based responses

--------------------------------------------------

📌 TITLE RULES:
- Generate a concise, descriptive \`title\` for the report.
- Use 3–8 words.
- Prefer a format like \`Interview Report — [Role]\` or \`Match Analysis for [Job Title]\`.
- Do not return the raw job description as the title unless it already reads like a clear role/title.
- Example titles:
  - \`Interview Report — Backend Engineer\`
  - \`Match Analysis for Software Developer\`
  - \`Prep Plan for Full Stack Role\`

--------------------------------------------------

📌 TECHNICAL QUESTIONS RULES:
- Generate scenario-based questions
- Focus on:
  - Core skills from Job Description
  - Technologies mentioned in Resume
- Topics may include:
  - performance, debugging
  - API design/security
  - database handling
  - architecture decisions

--------------------------------------------------

📌 BEHAVIORAL QUESTIONS RULES:
- Focus on:
  - teamwork
  - problem solving
  - learning ability
  - ownership
- Answers MUST follow STAR method:
  - Situation
  - Task
  - Action
  - Result

--------------------------------------------------

📌 SKILL GAPS RULES:
- Compare Job Description vs Resume
- Identify missing or weak areas
- Assign severity:
  - high → completely missing but required
  - medium → basic knowledge but needs improvement
  - low → minor improvement needed

--------------------------------------------------

📌 PREPARATION PLAN RULES:
- Must be PRACTICAL and ACTIONABLE
- Each task should involve:
  - building something
  - implementing a concept
  - practicing interview questions
- Avoid vague tasks like "learn X"
- Ensure logical progression from basics → advanced

--------------------------------------------------

📦 OUTPUT FORMAT (STRICT):

{
  "title": "string",
  "matchScore": number,

  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "skillGaps": [
    {
      "skill": "string",
      "severity": "low|medium|high"
    }
  ],

  "preparationPlans": [
    {
      "day": number,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}

--------------------------------------------------

🔢 STRICT COUNTS:
- technicalQuestions = 5
- behavioralQuestions = 5
- skillGaps = 5
- preparationPlans = 7

--------------------------------------------------

📄 INPUT DATA:

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

     const response = await retryGenerate(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      })
    );

    console.log("🔍 RAW AI RESPONSE:", response.text);

let parsed = cleanJson(response.text);

    // ✅ STRICT NORMALIZATION (NO CONFLICT)
    const normalizeArray = (arr, length) => {
      if (!Array.isArray(arr)) return [];

      if (arr.length > length) return arr.slice(0, length);

      if (arr.length < length) {
        // pad missing items
        const diff = length - arr.length;
        return [...arr, ...Array(diff).fill(arr[arr.length - 1] || {})];
      }

      return arr;
    };

    parsed = {
      title: parsed.title?.trim() || "Interview Report",

      matchScore:
        typeof parsed.matchScore === "number"
          ? parsed.matchScore
          : 70,

      technicalQuestions: normalizeArray(parsed.technicalQuestions, 5),
      behavioralQuestions: normalizeArray(parsed.behavioralQuestions, 5),
      skillGaps: normalizeArray(parsed.skillGaps, 5),
      preparationPlans: normalizeArray(parsed.preparationPlans, 7),
    };

    // ✅ FINAL VALIDATION (NO SECOND AI CALL)
    const result = interviewReportSchema.safeParse(parsed);

    if (!result.success) {
      console.log("❌ VALIDATION ERROR:", result.error);
      throw new Error("Invalid AI response format");
    }

    return result.data;

  } catch (error) {
    console.error("❌ AI ERROR:", error.message);
    throw error;
  }
}
 // ✅ CLOSE FUNCTION HERE

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
const pdfBuffer = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: {
    top: "20px",
    bottom: "20px",
    left: "20px",
    right: "20px"
  }
});
  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resuePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using a library like Puppeteer or pdf-lib.",
      ),
  });

  // const prompt = `Generate  resume for a candidate with the following details:
  //                 Self Description: ${selfDescription}
  //                 Resume: ${resume}
  //                 Job Description: ${jobDescription}
                  
  //                 The response should be a JSON object with a single field "html" containing the HTML content of the resume. The HTML should be well-structured and suitable for conversion to PDF.`;


  const prompt = `
You are an expert resume builder.

Generate a professional ATS-friendly resume in clean HTML format.

Rules:
- Use proper sections: Name, Summary, Skills, Experience, Education
- Use minimal inline CSS (no external CSS)
- Ensure A4 PDF compatibility
- Keep layout clean and modern

Candidate Details:
Self Description: ${selfDescription}
Resume: ${resume}
Job Description: ${jobDescription}

Return ONLY valid JSON:
{
  "html": "<full HTML here>"
}
`;

  const response = await ai.models.generateContent({
   model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resuePdfSchema),
    },
  });

  let jsonContent;

  try {
    jsonContent = JSON.parse(response.text);
  } catch (err) {
    console.error("Invalid JSON from AI:", response.text);
    throw new Error("AI response parsing failed");
  }
  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generteInterviewReport, generateResumePdf };
