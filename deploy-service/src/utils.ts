import { exec } from "child_process";
import path from "path";
import fs from "fs"
import { uploadFile } from "./aws";

export function buildProject(id : string) {
    return new Promise((resolve) => {
        const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install --force && npm run build`)

        child.stdout?.on('data', function(data) {
            console.log('stdout : ', data)
        })
        child.stderr?.on('data', function(data) {
            console.log('stderr : ', data)
        })

        child.on('close', function(code) {
            resolve("")
        })
    })
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

export async function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles?.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}



// Helper to remove source code after build
export async function removeSourceCode(id : string) {
    const sourcePath = path.join(__dirname, "output", id); // Adjust the path as needed

    // Check if source code folder exists
    if (fs.existsSync(sourcePath)) {
        try {
            // Remove the source code directory (recursive deletion)
            fs.rmdirSync(sourcePath, { recursive: true });
            console.log(`Source code for ${id} has been removed.`);
        } catch (error) {
            console.error(`Error removing source code for ${id}:`, error);
        }
    } else {
        console.log(`Source code folder for ${id} not found.`);
    }
}
