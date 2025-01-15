import express from "express"
import { S3 } from "aws-sdk";

const s3 = new S3({
    accessKeyId : process.env.ACCESS_KEY_ID,
    secretAccessKey : process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT
})
const app = express()

app.get("/*", async (req, res) => {
    const host = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path;

    const contents = await s3.getObject({
        Bucket : "vercel",
        Key : `dist/${id}${filePath}`
    }).promise();
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
            ".txt": "text/plain"
        };
     const fileExtension = filePath.slice(filePath.lastIndexOf("."));
     const contentType = mimeTypes[fileExtension] || "application/octet-stream";

    res.set("Content-Type", contentType);
    res.send(contents.Body)

})

app.listen(5001)