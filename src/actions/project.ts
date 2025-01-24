/* eslint-disable @typescript-eslint/no-unsafe-return */
"use server";
import { db } from "@/server/db";
import redis from "@/lib/redis";

export async function getAllProjects(userId: string) {

  const cachedProjects = await redis.get(`projects:${userId}`);
  if (cachedProjects) {
    console.log("Fetching from cache");
    try {
      return JSON.parse(cachedProjects); 
    } catch (error) {
      console.error("Error parsing cached data:", error);
      return []; 
    }
  }


  const data = await db.project.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!data || data.length === 0) {
    return []; 
  }

  await redis.set(`projects:${userId}`, JSON.stringify(data), "EX", 3600 * 24); 

  return data;
}

// Delete a user project
export async function deleteUserProject(userId: string, id: string, token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL_BACKEND_ACCESS}/remove/user/${userId}/project/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok || response.status !== 200) {
      return false;
    }

    await redis.del(`projects:${userId}`);
    return true;
  } catch (error) {
    console.error("Error deleting project:", error); 
    return false; 
  }
}
