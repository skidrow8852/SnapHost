/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// check if URL is a valid Github repository URl
export function isValidGitHubUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    const isGitHub = parsedUrl.hostname === "github.com" || parsedUrl.hostname.endsWith(".github.com");

    const isValidProtocol = /^https?:$/.test(parsedUrl.protocol);
    
    const pathnameParts = parsedUrl.pathname.split("/").filter(Boolean) ; 
    const isValidPath = pathnameParts.length === 2 && pathnameParts[1].endsWith(".git");

    return isGitHub && isValidProtocol && isValidPath;
  } catch (error) {
    return false; 
  }
}

// Extract username and repository name from a github URL
export function extractRepoDetails(repoUrl : string, projectname : string) {
  try{

    const regex = /https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/;
    const match = regex.exec(repoUrl);
  
    if (match) {
      const [_, username, repoName] = match; 
      return `${username}/${repoName}`;
    } else {
      throw new Error("Invalid GitHub repository URL");
    }
  }catch(e){
    return `github.com/${projectname}`
  }
}


export const generateToken = async (userId: string) => {
  try {
    const response = await fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (response.ok) {
      const data = await response.json();
      const authToken = data.authToken;
      return authToken;
    }
    return "";
  } catch (e) {
    return "";
  }
};