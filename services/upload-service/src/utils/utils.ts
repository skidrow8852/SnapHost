import path from "path";
import fs from "fs"

const DEFAULT_MAX_LEN = 10;

// Generate random string
export function generate(length: number = DEFAULT_MAX_LEN): string {
    const subset = "1234567890qwertyuiopasdfghjklzxcvbnm";
    return Array.from({ length }, () => subset[Math.floor(Math.random() * subset.length)]).join('');
}


// identify a React project versus a static project 
export const getProjectType = async (repoPath: string): Promise<string> => {
    const packageJsonPath = path.join(repoPath, "package.json");
    const indexPath = path.join(repoPath, "index.html");

    try {
        // Check for the presence of package.json to determine if it's a Node.js project
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

            // Check for Next.js
            if (packageJson.dependencies?.["next"]) {
                return "nextjs";
            }

            // Check for Svelte
            if (
                packageJson.dependencies?.["svelte"] ||
                packageJson.devDependencies?.["svelte"]
            ) {
                return "svelte";
            }

            // Check for Remix
            if (packageJson.dependencies?.["remix"]) {
                return "remix";
            }

            // Check for React
            if (packageJson.dependencies?.["react"]) {
                return "react";
            }
        }

        // Check for a static project
        if (fs.existsSync(indexPath)) {
            return "static";
        }

        // If no match, return unknown
        return "unknown";
    } catch (error) {
        console.error("Error identifying project type:", error);
        return "unknown"; // Default case if an error occurs
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