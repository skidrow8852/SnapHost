import fs from "fs";
import path from "path";

export const getAllFiles = (folderPath: string): string[] => {
    const response: string[] = [];
    const allFilesFolders = fs.readdirSync(folderPath);

    allFilesFolders.forEach((file) => {
        const name = path.join(folderPath, file); 
        if (fs.statSync(name).isDirectory()) {
            response.push(...getAllFiles(name)); 
        } else {
            response.push(name); 
        }
    });

    return response;
};
