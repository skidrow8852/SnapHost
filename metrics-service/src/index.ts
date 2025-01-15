const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = 5002;

// Middleware to parse JSON
app.use(express.json());

/**
 * Endpoint to capture screenshot and get status of a website
 */
app.post("/screenshot", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required in the request body." });
    }

    try {
        // Launch Puppeteer browser
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        let status = null;

        // Intercept requests to capture HTTP status
        page.on("response", (response) => {
            if (response.url() === url) {
                status = response.status();
            }
        });

        // Navigate to the URL
        await page.goto(url, { waitUntil: "networkidle2" });

        // Take a screenshot
        const screenshotPath = path.join(__dirname, "screenshots", `${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath });

        // Close the browser
        await browser.close();

        // Send response
        res.json({
            url,
            status,
            screenshot: `Screenshot saved at ${screenshotPath}`,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while processing the request." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Screenshot service is running on http://localhost:${PORT}`);
});
