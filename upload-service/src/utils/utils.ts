import path from "path";
import fs from "fs"

const MAX_LEN = 10;

// Generate random string
export function generate(){
    let ans = ""
    const subset = "1234567890qwertyuiopasdfghjklzxcvbnm";
    for(let i=0;i<MAX_LEN;i++){
        ans += subset[Math.floor(Math.random() * subset.length)]
    }
    return ans;
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
export const deleteFolderRecursive = (folderPath : string) => {
            const files = fs.readdirSync(folderPath);
            files.forEach((file) => {
                const currentPath = path.join(folderPath, file);
                if (fs.lstatSync(currentPath).isDirectory()) {
                    deleteFolderRecursive(currentPath);  // Recursively delete subfolders
                } else {
                    fs.unlinkSync(currentPath);  // Delete the file
                }
            });
            fs.rmdirSync(folderPath);  // Remove the now-empty folder
        };