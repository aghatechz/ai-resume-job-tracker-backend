export const generateResumePDF = async (req, res) => {
    // PDF generation relies on Puppeteer/Chromium, which cannot run on the
    // Vercel serverless runtime. Return a clear message instead of crashing.
    return res.status(501).json({
        message:
            "PDF download isn't available in this deployment. Server-side PDF rendering (Puppeteer/Chromium) isn't supported on Vercel serverless.",
    });
};
