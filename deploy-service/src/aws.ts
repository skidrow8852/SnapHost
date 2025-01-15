
import { S3 } from "aws-sdk";
import fs from "fs"
import path from "path"

const s3 = new S3({
    accessKeyId : process.env.ACCESS_KEY_ID,
    secretAccessKey : process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT
})

export async function downloadS3Folder(pathId : string) {
    const allFiles = await s3.listObjectsV2({
        Bucket : "vercel",
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
                Bucket : "vercel",
                Key
            }).createReadStream().pipe(outputFile)
            .on("finish", () => {
                resolve("")
            }) || []

            await Promise.all(allPromises?.filter(x => x !== undefined))

        })
    })
    
}

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}