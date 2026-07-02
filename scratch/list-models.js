import dotenv from "dotenv";
dotenv.config();

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_KEY}`;
  try {
    console.log("Fetching models list from Gemini API...");
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response (${response.status}):`, errorText);
      return;
    }
    const data = await response.json();
    console.log("Available models:");
    if (data.models) {
      data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } else {
      console.log("No models array found:", data);
    }
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

test();
