import { uploadFile } from "./aws";

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

export async function screenshotPage(url: string, id: string) {
    if (!url) {
        return { msg: "URL is required in the request body.", error: true };
    }

    try {
        // Ensure the screenshots directory exists
        const screenshotsDir = path.join(__dirname, "screenshots");
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true }); // Create the directory if it doesn't exist
        }

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
        const s3FileName = `${id}_${Date.now()}.png`;
        const screenshotPath = path.join(screenshotsDir, s3FileName);
        await page.screenshot({ path: screenshotPath });
        // Close the browser
        await browser.close();

        // Upload the screenshot to the S3 bucket
        await uploadFile(s3FileName, screenshotPath);

        // Send response
        return {
            status,
            screenshot: s3FileName,
        };
    } catch (error) {
        console.error("Error:", error);
        return { msg: "An error occurred while processing the request.", error: true };
    }
}
