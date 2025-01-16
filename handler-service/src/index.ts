
import express from "express"
import { S3 } from "aws-sdk";
import {listener} from "./redis"
const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT,
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
        const id = host.split(".")[0];
        let filePath = req.path;

        // Default to index.html if the path is empty
        if (filePath == "/" || !filePath.includes(".")) {
            filePath = "/index.html";
        }

        // Try fetching from the dist folder first
        let contents = await getS3Object(id, filePath, "dist");

        // If the file was not found in the dist folder, try the build folder
        if (!contents) {
            console.log(`File not found in dist. Trying build folder for ${filePath}`);
            contents = await getS3Object(id, filePath, "build");
        }

        // If the file still wasn't found, return 404
        if (!contents) {
            return res.status(404).send("File not found.");
        }

        // Set the appropriate content type based on file extension
        const mimeTypes = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".ttf": "font/ttf",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".otf": "font/otf",
            ".eot": "application/vnd.ms-fontobject",
            ".txt": "text/plain",
        };

        const fileExtension = filePath.slice(filePath.lastIndexOf("."));
        const contentType = mimeTypes[fileExtension] || "application/octet-stream";

        res.set("Content-Type", contentType);
        res.send(contents.Body);
        const redisKey = `pageViews:${id}`;
        await listener.incr(redisKey);

    } catch (error) {
        console.error("Error fetching file from S3:", error);

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
                Bucket: "builds",
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
