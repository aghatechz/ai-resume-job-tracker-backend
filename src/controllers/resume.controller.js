import Resume from "../models/Resume.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export const analyzeResume = async (req, res) => {
  const { resumeText } = req.body;
  const userId = req.user._id;

  if (!resumeText || !userId) {
    return res.status(400).json({ message: "Resume text or userId missing" });
  }

  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const prompt = `
You are an AI resume expert.
Analyze this resume and return ONLY valid JSON with the following fields:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "summary": "string",
  "experience": "string",
  "education": "string",
  "skills": "string",
  "score": number,            // overall resume quality score 0-100
  "atsScore": number,         // ATS compatibility percentage 0-100
  "keywordsMatched": number,  // count of important/industry keywords found in the resume
  "formatQuality": number,    // formatting/structure quality score 0-100
  "impactScore": number,      // impact of achievements/action verbs score 0-100
  "strengths": [string],      // 3-6 concrete strengths of this resume
  "suggestions": [string],    // 3-6 actionable improvements
  "keywords": [string],       // important keywords/skills detected in the resume
  "correctedText": "string"   // improved full resume text
}

Return ONLY valid JSON, no markdown, no extra text.

Resume:
${resumeText}
`;



    const modelName = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
    const model = ai.getGenerativeModel({ model: modelName });

    // Retry logic for rate limits (429)
    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        if (err.status === 429 && attempt < 2) {
          const delay = Math.pow(2, attempt) * 2000;
          console.log("Rate limited, retrying in " + delay + "ms...");
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw err;
        }
      }
    }
    
    // Better way to get response text
    const aiText = result.response.text().trim();
    if (!aiText) {
      return res.status(500).json({ message: "AI response empty" });
    }

    const cleanedText = aiText
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();


    let aiResult;
    try {
      aiResult = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Failed to parse AI JSON:", err.message);
      return res.status(500).json({
        message: "Invalid AI JSON",
        error: err.message,
        raw: aiText, 
      });
    }

    aiResult.score = aiResult.score || 0;
    aiResult.atsScore = aiResult.atsScore || 0;
    aiResult.keywordsMatched = aiResult.keywordsMatched ?? 0;
    aiResult.formatQuality = aiResult.formatQuality ?? 0;
    aiResult.impactScore = aiResult.impactScore ?? 0;
    aiResult.strengths = aiResult.strengths || [];
    aiResult.keywords = aiResult.keywords || [];
    aiResult.summary = aiResult.summary || "";
    aiResult.correctedText = aiResult.correctedText || resumeText;
    aiResult.suggestions = aiResult.suggestions || [];

    const resume = await Resume.create({
      userId,
      originalText: resumeText,
      aiImprovedText: aiResult.correctedText,
      aiSummary: aiResult.summary,
      aiScore: aiResult.score,
      atsScore: aiResult.atsScore,
      suggestions: aiResult.suggestions,
    });

    res.status(201).json({
      message: "Resume analyzed & saved via SDK",
      resume,
      aiResult,
    });
  } catch (error) {
    console.error("Resume AI SDK Error:", error.message);
    res.status(500).json({
      message: "AI analysis failed",
      error: error.message,
    });
  }
};

