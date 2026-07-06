import fs from "fs";
import path from "path";

export const downloadCareerResumePDF = async (req, res) => {
  try {
    // Lazy import: keeps puppeteer/Chromium out of the serverless cold start.
    const { default: puppeteer } = await import("puppeteer");

    const { templateName, data } = req.body;

    if (!templateName) return res.status(400).json({ message: "Template name missing" });

    const templatePath = path.join(process.cwd(), "src/templates", templateName);
    if (!fs.existsSync(templatePath)) return res.status(404).json({ message: "Template not found" });

    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholders
    for (const key in data) {
      let value = data[key] || "N/A";

      // Convert skills array to span badges
      if (Array.isArray(value)) {
        value = value.map(s => `<span>${s}</span>`).join("");
      }

      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      html = html.replace(regex, value);
    }

    // ✅ Puppeteer browser launch
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=career_resume.pdf`
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ message: "PDF generation failed", error: error.message });
  }
};
