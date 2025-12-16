import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export const generateResumePDF = async (req, res) => {
    try {
        const { templateName, data } = req.body;

        if(!templateName) {
            return res.status(400).json({ message: "Template name missing" });
        }

        const templatePath = path.join(process.cwd(), "src/templates", templateName);

        if(!fs.existsSync(templatePath)) {
            return res.status(404).json({ message: "Template not found" });
        }

        let html = fs.readFileSync(templatePath, "utf-8");

        for (const key in data) {
            let value = data[key]?.trim();
            if (!value) value = "N/A";
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            html = html.replace(regex, value);
        }

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

        await browser.close();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resumebyagha.pdf`,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "PDF generation failed", error: error.message });
    }
};
