import Resume from "../models/Resume.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const analyzeResume = async (req, res) => {
  const { resumeText } = req.body;
  const userId = req.user._id;

  if (!resumeText || !userId) {
    return res.status(400).json({ message: "Resume text or userId missing" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

  const prompt = `
You are an AI resume expert.
Analyze this resume and return ONLY valid JSON with the following fields:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "experience": "string",
  "education": "string",
  "skills": "string",
  "score": number,
  "atsScore": number,
  "suggestions": [string],
  "correctedText": "string"
}

Resume:
${resumeText}
`;


    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ text: prompt }],
    });

    const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
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
    aiResult.correctedText = aiResult.correctedText || resumeText;
    aiResult.suggestions = aiResult.suggestions || [];

    const resume = await Resume.create({
      userId,
      originalText: resumeText,
      aiImprovedText: aiResult.correctedText,
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

