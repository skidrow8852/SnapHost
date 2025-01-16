import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
    accessKeyId : process.env.ACCESS_KEY_ID,
    secretAccessKey : process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT
})


export const uploadFile = async (fileName: string, localFilePath: string) => {
    try {
        const fileContent = fs.readFileSync(localFilePath);
        const response = await s3.upload({
            Body: fileContent,
            Bucket: "snaphost",
            Key: fileName,
        }).promise();
        console.log(response);
    } catch (error) {
        console.error(`Error uploading file ${fileName}:`, error);
    }
};
