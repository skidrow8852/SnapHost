
import { S3 } from "aws-sdk";
import fs from "fs"
import path from "path"

const s3 = new S3({
    accessKeyId : process.env.ACCESS_KEY_ID,
    secretAccessKey : process.env.SECRET_ACCESS_KEY
})

// download files from S3 folder
export async function downloadS3Folder(pathId : string) {
    const allFiles = await s3.listObjectsV2({
        Bucket : "snaphost",
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
                Bucket : "snaphost",
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
        Bucket: "snaphost",
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
            Bucket: "snaphost", 
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
                Bucket: "snaphost",
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


// Remove the entire project folder
export async function removeProjectFolderFromS3(projectId: string) {
    const prefix = `output/${projectId}/`;

    try {
        let continuationToken: string | undefined = undefined;

        do {
            // List all objects in the specified prefix (folder)
            const listParams = {
                Bucket: "snaphost",
                Prefix: prefix,
                ContinuationToken: continuationToken, // For handling pagination
            };

            const listObjectsResponse = await s3.listObjectsV2(listParams).promise();
            const filesToDelete = listObjectsResponse.Contents?.map((file) => ({
                Key: file.Key,
            })) || [];

            if (filesToDelete.length > 0) {
                // Delete the files from S3
                const deleteParams = {
                    Bucket: "snaphost",
                    Delete: {
                        Objects: filesToDelete,
                    },
                };

                const deleteResponse = await s3.deleteObjects(deleteParams).promise();
                console.log("Deleted files from S3:", deleteResponse.Deleted);
            } else {
                console.log("No files to delete from S3 for the specified folder.");
            }

            continuationToken = listObjectsResponse.NextContinuationToken; // Update the token for the next iteration
        } while (continuationToken);

        console.log(`Successfully removed all files under folder: ${prefix}`);
    } catch (error) {
        console.error("Error removing source code from S3:", error);
    }
}
