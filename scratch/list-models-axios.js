import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_KEY}`;
  try {
    console.log("Fetching models list via axios...");
    const response = await axios.get(url);
    console.log("Available models:");
    if (response.data && response.data.models) {
      response.data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } else {
      console.log("Response data:", response.data);
    }
  } catch (e) {
    if (e.response) {
      console.error(`API Error (${e.response.status}):`, JSON.stringify(e.response.data));
    } else {
      console.error("Error:", e.message);
    }
  }
}

test();
