import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { uploadFile } from "./aws";

// Build project function
export function buildProject(id: string) {
    return new Promise((resolve, reject) => {
        const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install --force && npm run build`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error during build: ${error.message}`);
            } else if (stderr) {
                reject(`stderr: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });

        child.stdout?.on('data', function (data) {
            console.log('stdout : ', data);
        });

        child.stderr?.on('data', function (data) {
            console.log('stderr : ', data);
        });
    });
}

// Helper to get all files in a directory recursively
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


// Function to copy final dist or build folder files to S3
export async function copyFinalDist(id: string) {
    const distFolderPath = path.join(__dirname, `output/${id}/dist`);
    const buildFolderPath = path.join(__dirname, `output/${id}/build`);
    
    // Determine which folder to copy: dist or build
    const folderToUse = fs.existsSync(distFolderPath) ? distFolderPath : buildFolderPath;
    const folderName = fs.existsSync(distFolderPath) ? "dist" : "build";

    const allFiles = getAllFiles(folderToUse);

    if (!allFiles.length) {
        console.log(`No files found in ${folderName} for project ${id}`);
        return;
    }

    for (const file of allFiles) {
        try {
            const relativePath = `${folderName}/${id}/` + file.slice(folderToUse.length + 1);
            await uploadFile(relativePath, file);
        } catch (error) {
            console.error(`Failed to upload file ${file}:`, error);
        }
    }
}

// Helper to remove source code after build
export async function removeSourceCode(id: string) {
    const sourcePath = path.join(__dirname, "output", id);

    // Check if source code folder exists
    if (fs.existsSync(sourcePath)) {
        try {
            // Remove the source code directory (recursive deletion)
            fs.rmSync(sourcePath, { recursive: true, force: true });
            console.log(`Source code for ${id} has been removed.`);
        } catch (error) {
            console.error(`Error removing source code for ${id}:`, error);
        }
    } else {
        console.log(`Source code folder for ${id} not found.`);
    }
}
