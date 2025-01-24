"use server";
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

// Delete a user Project
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
    return true;
  }

  return false;
}
