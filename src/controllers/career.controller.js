// src/controllers/career.controller.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import CareerResume from "../models/careerResume.js";
import fs from "fs";
import path from "path";

dotenv.config();

export const polishCareerResume = async (req, res) => {
  const userId = req.user._id;

  console.log("===== Incoming Request =====");
  console.log("Body:", req.body);
  console.log("File:", req.file);

  // 1️⃣ Frontend se text
  let resumeText = req.body.resumeText || "";  
  const jobDescription = req.body.jobDescription || "";

  // 2️⃣ File upload check
  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
      const fileBuffer = fs.readFileSync(req.file.path);

      if (ext === ".pdf") {
        // Lazy import so pdf-parse/pdfjs-dist load only when a PDF arrives.
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: fileBuffer });
        try {
          const data = await parser.getText();
          resumeText = data.text || resumeText;
        } finally {
          await parser.destroy().catch(() => {});
        }
      } else if (ext === ".docx") {
        const { default: mammoth } = await import("mammoth");
        const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
        resumeText = value || resumeText;
      } else if (ext === ".txt") {
        resumeText = fileBuffer.toString() || resumeText;
      }
    } catch (err) {
      // If server-side parsing fails (can happen on serverless), fall back to
      // the resumeText the client already extracted and sent along with the file.
      console.error("File parse failed, using client-provided text:", err.message);
      if (!resumeText) {
        return res.status(400).json({
          message: "Could not read the uploaded file. Please paste your resume text instead.",
        });
      }
    } finally {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
  }

  // 3️⃣ Validation
  if (!resumeText || !jobDescription) {
    return res.status(400).json({ message: "Resume text or Job Description missing" });
  }

  try {
    // 4️⃣ AI setup
    const ai = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    const prompt = `
You are an expert career resume coach.

Using the given resume and job description, generate an **optimized, concise resume** that can fit within **one A4 page** when printed.

Return the result STRICTLY in the following JSON format:

Return ONLY valid JSON, no extra text.

{
  "name": "...",
  "email": "...",
  "phone": "...",
  "summary": "...",
  "experience": "...",
  "education": "...",
  "skills": ["...", "..."],
  "score": ...,
  "atsScore": ...,
  "correctedText": "Full optimized resume text here, concise and formatted for A4",
  "suggestions": ["..."]
}

Constraints:
- Keep text concise; avoid long paragraphs.
- Use short bullet points where possible.
- Limit each experience/education entry to 1-2 lines.
- Skills should be in a compact array or comma-separated list.
- Summary should be 2-3 sentences max.

Resume:
${resumeText}

Job Description:
${jobDescription}
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

    const aiText = result.response.text().trim();
    console.log("Raw AI Response:", aiText);

    if (!aiText) {
      return res.status(500).json({ message: "Empty AI response" });
    }

    // 5️⃣ Clean AI JSON
    const cleanedText = aiText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    console.log("Cleaned AI JSON:", cleanedText);

    let aiResult;
    try {
      aiResult = JSON.parse(cleanedText);
    } catch (err) {
      return res.status(500).json({
        message: "Invalid AI JSON",
        raw: aiText
      });
    }

    // 6️⃣ Save to DB
    const savedResume = await CareerResume.create({
      userId,
      originalResume: resumeText,
      jobDescription,
      aiCorrectedResume: aiResult.correctedText || resumeText,
      score: aiResult.score || 0,
      atsScore: aiResult.atsScore || 0,
      suggestions: aiResult.suggestions || []
    });

    // 7️⃣ Response
    res.status(201).json({
      message: "Career resume polished successfully",
      aiResult,
      savedResume
    });

  } catch (error) {
    console.error("Career AI Error:", error.message);
    res.status(500).json({
      message: "Career resume polishing failed",
      error: error.message
    });
  }
};
