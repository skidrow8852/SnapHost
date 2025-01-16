import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function getUserProjects(userId: string) {
  try {
    const userWithProjects = await prisma.user.findUnique({
      where: {
        id: userId, 
      },
      include: {
        projects: true,
      },
    });

    if (!userWithProjects) {
      console.log("User not found.");
      return null;
    }
    return userWithProjects.projects;
  } catch (error) {
    console.error("Error fetching user projects:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}


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
