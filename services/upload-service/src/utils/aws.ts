import { S3 } from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const s3 = new S3({
    accessKeyId : process.env.ACCESS_KEY_ID,
    secretAccessKey : process.env.SECRET_ACCESS_KEY,
})


export const uploadFile = async (fileName: string, localFilePath: string) => {
    try {
        const normalizedFileName = fileName.replace(/\\/g, "/");
        const fileContent = fs.readFileSync(localFilePath);
        await s3.upload({
            Body: fileContent,
            Bucket: "snaphost",
            Key: normalizedFileName,
        }).promise();
    } catch (error) {
        console.error(`Error uploading file ${fileName}:`, error);
    }
};
