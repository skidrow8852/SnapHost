
import express from "express"
import { S3 } from "aws-sdk";
import {listener} from "./redis"
const mime = require("mime");
import dotenv from "dotenv";
dotenv.config();
const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const app = express() as any;

(async () => {
    try {
        await listener.connect();
        console.log("Connected to Redis");
    } catch (connectionError) {
        console.error("Error connecting to Redis:", connectionError);
    }
})();

app.get("/*", async (req, res) => {
    try {
        const host = req.hostname;
        const id = host.split(".")[0]; // Extract subdomain
        let filePath = req.path;

        // Default to index.html if the path is empty or does not include a file extension
        if (filePath === "/" || !filePath.includes(".")) {
            filePath = "/index.html";
        }
        let folderName = 'dist'

        // Fetch the file from the S3 'dist' folder first
        let contents = await getS3Object(id, filePath, folderName);

        // If the file was not found in the 'dist' folder, try the 'build' folder
        if (!contents) {
            folderName = 'build'
            contents = await getS3Object(id, filePath, "build");
            
        }

        // Handle missing files
        if (!contents) {
            // If the request is for a non-file route, return index.html
            if (filePath !== "/index.html") {
                filePath = "/index.html";
                contents = await getS3Object(id, filePath, folderName);
            }

            if (!contents) {
                return res.status(404).send("File not found.");
            }
        }

        // Set the appropriate MIME type
        const contentType = mime.getType(filePath) || "application/octet-stream";
        res.set("Content-Type", contentType);

        // Add Cache-Control headers for static assets
        if ([".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico"].includes(filePath.slice(filePath.lastIndexOf(".")))) {
            res.set("Cache-Control", "public, max-age=2592000"); // Cache for 1 month
        }

        res.send(contents.Body);

        // Increment page view count in Redis
        const redisKey = `pageViews:${id}`;
        await listener.incr(redisKey);


    } catch (error) {
        console.error("Error handling request:", error);
        if (error.code === "NoSuchKey") {
            return res.status(404).send("File not found.");
        }

        res.status(500).send("An error occurred while processing the request.");
    }
});

// Helper function to fetch object from S3
async function getS3Object(id : string, filePath : string, folder : string) {
    try {
        const response = await s3
            .getObject({
                Bucket: "snaphost",
                Key: `${id}/${folder}${filePath}`,
            })
            .promise();

        return response;
    } catch (error) {
        if (error.code === "NoSuchKey") {
            return null; 
        }
        throw error; 
    }
}

const shutdown = async() => {
    console.log("Shutting down...");
    await listener.disconnect();
    process.exit(0);
}
process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);

app.listen(5001, () => {
    console.log("Server is running on port 5001");
});
