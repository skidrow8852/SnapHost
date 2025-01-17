import path from "path";
import fs from "fs"

const DEFAULT_MAX_LEN = 10;

// Generate random string
export function generate(length: number = DEFAULT_MAX_LEN): string {
    const subset = "1234567890qwertyuiopasdfghjklzxcvbnm";
    return Array.from({ length }, () => subset[Math.floor(Math.random() * subset.length)]).join('');
}


// identify a React project versus a static project 
export const getProjectType = async (repoPath : string) => {
    const packageJsonPath = path.join(repoPath, "package.json");
    const indexPath = path.join(repoPath, "index.html");

    try {
        // Check for the presence of package.json to determine if it's a Node.js project
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = require(packageJsonPath);

            // Check if it's a React project
            if (packageJson.dependencies && packageJson.dependencies["react"]) {
                return "react";
            }
        }

        if (fs.existsSync(indexPath)) {
            return "static";  
        }


        return "unknown"; 
    } catch (error) {
        console.error("Error identifying project type:", error);
        return "Unknown";  // Default case if an error occurs
    }
};


// Clean up: Delete the local folder after upload
export const deleteFolder = (folderPath: string) => {
    try {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Folder deleted: ${folderPath}`);
    } catch (err) {
        console.error(`Error while deleting folder ${folderPath}:`, err);
    }
};