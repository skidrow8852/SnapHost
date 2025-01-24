import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { deleteFolderFromS3, folderExistsInS3, renameFolderInS3, uploadFile } from "./aws";

// Build project function
export function buildProject(id: string) {
    return new Promise((resolve, reject) => {
        const projectPath = path.join(__dirname, `output/${id}`);
        const command = `cd ${projectPath} && npm install --force && npm run build`;

        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error during build: ${error.message}`));
            } else if (stderr) {
                reject(new Error(`stderr: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });

        child.stdout?.on('data', (data) => {
            console.log('stdout:', data);
        });

        child.stderr?.on('data', (data) => {
            console.log('stderr:', data);
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
    const distFolderPath = path.join(__dirname, 'output', id, 'dist');
    const buildFolderPath = path.join(__dirname, 'output', id, 'build');

    // Determine which folder to copy: dist or build
    const folderToUse = fs.existsSync(distFolderPath) ? distFolderPath : buildFolderPath;
    const folderName = fs.existsSync(distFolderPath) ? "dist" : "build";

    if (!fs.existsSync(folderToUse)) {
        console.log(`No ${folderName} folder found for project ${id}`);
        return;
    }

    const allFiles = getAllFiles(folderToUse);

    if (!allFiles.length) {
        console.log(`No files found in ${folderName} for project ${id}`);
        return;
    }

    try {
        const s3TempFolderPath = `output/${id}/temp-${folderName}`; // Temporary folder for new build
        const s3FinalFolderPath = `output/${id}/${folderName}`; // Final folder for serving the build

        // Upload the new build to a temporary folder in S3
        for (const file of allFiles) {
            const relativePath = path.join('output', id, `temp-${folderName}`, path.relative(folderToUse, file));
            const normalizedRelativePath = relativePath.replace(/\\/g, "/");

            await uploadFile(normalizedRelativePath, file);
        }

        console.log(`Uploaded new ${folderName} folder to temporary location: ${s3TempFolderPath}.`);

        // Check if the final folder exists in S3
        const finalFolderExists = await folderExistsInS3(s3FinalFolderPath);

        // Delete the old final folder (if it exists)
        if (finalFolderExists) {
            await deleteFolderFromS3(s3FinalFolderPath);
            console.log(`Deleted old ${folderName} folder from S3.`);
        }

        // Rename the temporary folder to the final folder
        await renameFolderInS3(s3TempFolderPath, s3FinalFolderPath);
        console.log(`Renamed temporary folder to final location: ${s3FinalFolderPath}.`);
    } catch (error) {
        console.error(`Error updating ${folderName} folder for project ${id}:`, error);
        throw error; // Propagate the error to stop further processing
    }
}


// Helper to remove source code after build
export async function removeSourceCode(id: string) {
    const sourcePath = path.join(__dirname, "output", id);

    if (fs.existsSync(sourcePath)) {
        try {
            fs.rmSync(sourcePath, { recursive: true, force: true });
            console.log(`Source code for ${id} has been removed.`);
        } catch (error) {
            console.error(`Error removing source code for ${id}:`, error);
            throw error; 
        }
    } else {
        console.log(`Source code folder for ${id} not found.`);
    }
}
