
import { S3 } from "aws-sdk";
import fs from "fs"
import path from "path"

const s3 = new S3({
    accessKeyId : process.env.ACCESS_KEY_ID,
    secretAccessKey : process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT
})

// download files from S3 folder
export async function downloadS3Folder(pathId : string) {
    const allFiles = await s3.listObjectsV2({
        Bucket : "builds",
        Prefix : pathId
    }).promise();

    const allPromises = allFiles?.Contents?.map(async ({Key}) => {
        return new Promise(async (resolve) => {
            if (!Key){
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key)
            const outputFile = fs.createWriteStream(finalOutputPath)
            const dirName = path.dirname(finalOutputPath)
            if(!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, {recursive : true})
            }
            s3.getObject({
                Bucket : "builds",
                Key
            }).createReadStream().pipe(outputFile)
            .on("finish", () => {
                resolve("")
            }) || []

        })
    })

    await Promise.all(allPromises?.filter(x => x !== undefined))
}

// Upload file to S3 bucket
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "builds",
        Key: fileName,
    }).promise();
    console.log(response);
}

// Remove source code from S3 folder
export async function removeSourceCodeFromS3(id : string) {
    const prefix = `output/${id}/`; 
    
    try {
        // List all objects in the specified prefix (folder)
        const listParams = {
            Bucket: "builds", 
            Prefix: prefix, 
        };
        
        const listObjectsResponse = await s3.listObjectsV2(listParams).promise();
        const filesToDelete = [];

        listObjectsResponse.Contents.forEach(file => {
            const fileKey = file.Key;

            if (!fileKey.includes("/dist/") && !fileKey.includes("/build/")) {
                filesToDelete.push({ Key: fileKey });
            }
        });

        if (filesToDelete.length > 0) {
            // Delete the unwanted files from S3
            const deleteParams = {
                Bucket: "builds",
                Delete: {
                    Objects: filesToDelete,
                },
            };

            const deleteResponse = await s3.deleteObjects(deleteParams).promise();
            console.log("Deleted files from S3:", deleteResponse);
        } else {
            console.log("No source code files to delete from S3.");
        }
    } catch (error) {
        console.error("Error removing source code from S3:", error);
    }
}