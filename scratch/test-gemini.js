import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  try {
    console.log("Initializing GoogleGenerativeAI with key:", process.env.GEMINI_KEY ? "FOUND" : "MISSING");
    const ai = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    console.log("Using model:", modelName);
    const model = ai.getGenerativeModel({ model: modelName });
    
    console.log("Sending test prompt...");
    const result = await model.generateContent("Hello, write a 3 word response.");
    const text = result.response.text();
    console.log("Response text:", text);
  } catch (error) {
    console.error("Gemini API Error details:", error);
  }
}

test();
