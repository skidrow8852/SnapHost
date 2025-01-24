
import express from "express"
import { S3 } from "aws-sdk";
import {listener} from "./redis"
const mime = require('mime-types')
import dotenv from "dotenv";
import { trackPageView } from "./helpers";
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

        let folderName = 'dist';

        // Fetch the file from the S3 'dist' folder first
        let contents = await getS3Object(id, filePath, folderName);

        // If the file was not found in the 'dist' folder, try the 'build' folder
        if (!contents) {
            folderName = 'build';
            contents = await getS3Object(id, filePath, folderName);
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
        const contentType = mime.lookup(filePath) || "application/octet-stream";
        res.set("Content-Type", contentType);

        // Cache-Control headers for static assets
        if ([".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico"].includes(filePath.slice(filePath.lastIndexOf(".")))) {
            res.set("Cache-Control", "public, max-age=2592000"); // Cache for 1 month
        }

        res.send(contents.Body);

        // Increment page view count in Redis
        await trackPageView(id);
    } catch (error) {
        console.error("Error handling request:", error);
        if (error.code === "NoSuchKey") {
            return res.status(404).send("File not found.");
        }

        res.status(500).send("An error occurred while processing the request.");
    }
});

// Helper function to fetch object from S3
async function getS3Object(id: string, filePath: string, folder: string) {
    try {
        // Try fetching the file from the final folder first
        const finalKey = `${id}/${folder}${filePath}`;
        const response = await s3
            .getObject({
                Bucket: "snaphost",
                Key: finalKey,
            })
            .promise();

        return response;
    } catch (error) {
        if (error.code === "NoSuchKey") {
            // If the file is not found in the final folder, try the temporary folder
            const tempKey = `${id}/temp-${folder}${filePath}`;
            try {
                const tempResponse = await s3
                    .getObject({
                        Bucket: "snaphost",
                        Key: tempKey,
                    })
                    .promise();

                return tempResponse;
            } catch (tempError) {
                if (tempError.code === "NoSuchKey") {
                    return null; 
                }
                throw tempError;
            }
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
