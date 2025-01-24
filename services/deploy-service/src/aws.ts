
import { S3 } from "aws-sdk";
import fs from "fs"
import path from "path"
import dotenv from "dotenv";
dotenv.config();

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
    const normalizedFileName = fileName.replace(/\\/g, "/");
    const fileContent = fs.readFileSync(localFilePath);
    await s3.upload({
        Body: fileContent,
        Bucket: "snaphost",
        Key: normalizedFileName,
    }).promise();
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


// Remove a folder inside the project folder
export async function deleteFolderFromS3(folderPath: string) {
    try {
        // List all objects in the folder
        const listParams = {
            Bucket: "snaphost",
            Prefix: folderPath,
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log(`No objects found in folder ${folderPath}.`);
            return;
        }

        // Prepare the list of objects to delete
        const deleteParams = {
            Bucket: "snaphost",
            Delete: {
                Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
            },
        };

        // Delete the objects
        await s3.deleteObjects(deleteParams).promise();
        console.log(`Deleted ${listedObjects.Contents.length} objects from folder ${folderPath}.`);
    } catch (error) {
        console.error(`Error deleting folder ${folderPath} from S3:`, error);
        throw error;
    }
}


// check if a specific folder exists
export async function folderExistsInS3(folderPath: string): Promise<boolean> {
    try {
        const listParams = {
            Bucket: "snaphost",
            Prefix: folderPath,
            MaxKeys: 1, 
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        // If Contents array is not empty, the folder exists
        return !!listedObjects.Contents && listedObjects.Contents.length > 0;
    } catch (error) {
        console.error(`Error checking if folder ${folderPath} exists in S3:`, error);
        throw error;
    }
}

// rename a folder in S3
export async function renameFolderInS3(sourceFolderPath: string, destinationFolderPath: string) {
    try {
        // List all objects in the source folder
        const listParams = {
            Bucket: "snaphost",
            Prefix: sourceFolderPath,
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log(`No objects found in source folder ${sourceFolderPath}.`);
            return;
        }

        // Copy each file from the source folder to the destination folder
        for (const { Key } of listedObjects.Contents) {
            const destinationKey = Key!.replace(sourceFolderPath, destinationFolderPath);

            await s3.copyObject({
                Bucket: "snaphost",
                CopySource: `snaphost/${Key}`,
                Key: destinationKey,
            }).promise();

            console.log(`Copied file: ${Key} -> ${destinationKey}`);
        }

        // Delete the source folder
        await deleteFolderFromS3(sourceFolderPath);
        console.log(`Deleted source folder: ${sourceFolderPath}.`);
    } catch (error) {
        console.error(`Error renaming folder ${sourceFolderPath} to ${destinationFolderPath}:`, error);
        throw error;
    }
}