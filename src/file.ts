import fs from "fs";
import path from "path";

export const getAllFiles = (folderPath : string) => {
    const response : string[] = []
    const allFilesFolders = fs.readdirSync(folderPath);
    allFilesFolders?.forEach(file => {
        const name = path.join(__dirname, folderPath, file)
        if (fs.statSync(name).isDirectory()){
            response.concat(getAllFiles(name))
        }else{
            response.push(name)
        }
    })
    return response;
}