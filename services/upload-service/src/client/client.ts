import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();



export async function createProject(fields : any) {
  try {
    const newProject = await prisma.project.create({
      data: fields
    });

    return newProject;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function createNotification(fields : any) {
  try {
    const notification = await prisma.notification.create({
      data: fields
    });

    return notification;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}


export async function updateProject(userId: string, id: string, updatedFields: Partial<{ status: string , type : string, screenshot : string}>) {
  try {
    const updatedProject = await prisma.project.update({
      where: {
        userId, projectId : id, 
      },
      data: updatedFields,
    });

    return updatedProject;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
