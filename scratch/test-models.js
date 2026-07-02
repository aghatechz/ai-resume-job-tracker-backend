import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function testCurrentModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

  // ✅ sahi model name
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

  console.log(`--- Testing ${modelName} ---`);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent("Hi");

    console.log(`Success with ${modelName}!`);
    console.log("Response:", result.response.text());

  } catch (error) {
    console.error(`Error with ${modelName}:`, error.message);
  }
}

testCurrentModel();