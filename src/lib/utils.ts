/* eslint-disable @typescript-eslint/no-unused-vars */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


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
