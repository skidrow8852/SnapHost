/* eslint-disable @typescript-eslint/no-unsafe-return */
"use server";
import { db } from "@/server/db";
import redis from "@/lib/redis";

export async function getAllProjects(userId: string) {
  const cachedProjects = await redis.get(`projects:${userId}`);
  if (cachedProjects) {
    console.log("from cache");
    return JSON.parse(cachedProjects);
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

  await redis.set(`projects:${userId}`, JSON.stringify(data));

  return data;
}

// Delete a user project
export async function deleteProject(userId: string, projectId: string) {
  const project = await db.project.findUnique({
    where: { userId, projectId },
  });

  if (!project) {
    return false;
  }

  const deleted = await db.project.delete({
    where: { projectId: projectId },
  });

  if (deleted) {
    await redis.del(`projects:${userId}`);
    return true;
  }

  return false;
}
