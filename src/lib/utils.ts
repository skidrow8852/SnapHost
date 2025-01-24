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

// Convert Date string to (ago)
export function timeAgo(dateString: string): string {
  try{

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds} sec ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours > 1 ? "hours" : "hour"} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} ${diffInDays > 1 ? "days" : "day"} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths > 1 ? "months" : "month"} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears > 1 ? "years" : "year"} ago`;
  }catch(e){
    return dateString
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