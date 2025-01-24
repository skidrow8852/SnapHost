"use server"
import { db } from "@/server/db";

// get all user projects
export async function getAllProjects(userId: string) {
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

  return data;
}
