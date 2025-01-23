import { type ProjectCardTypes } from "@/lib/types";
import { create } from "zustand";


type State = {
  projects: ProjectCardTypes[];
  filteredProjects: ProjectCardTypes[]; 
  setProjects: (projects: ProjectCardTypes[]) => void;
  setFilteredProjects: (projects: ProjectCardTypes[]) => void;
};

type Action = {
  addProject: (project: ProjectCardTypes) => void;
  updateProject: (projectId: string, updatedData: Partial<ProjectCardTypes>) => void;
  deleteProject: (projectId: string) => void;
};

const values = [
  {
    id: "123hslkdjslkdjsd",
    projectId: "project1",
    name: "This is just a test project",
    userId: "876873463",
    repoUrl: "https://github.com/skidrow8852/SnapHost.git",
    createdAt: new Date('2024-08-02T12:00:00Z'),
    updatedAt: new Date('2024-08-02T12:00:00Z'),
    image: "",
    commit: "This is my first commit",
    branch: "main",
    time: new Date().toLocaleString(),
    type: "react",
    status: "deploying",
  },
  {
    id: "456sdfkjsdlfkjdslk",
    projectId: "project2",
    name: "Another test project",
    userId: "123457890",
    repoUrl: "https://github.com/devuser123/ProjectTwo.git",
    createdAt: new Date('2024-08-02T12:00:00Z'),
    updatedAt: new Date('2024-08-02T12:00:00Z'),
    image: "",
    commit: "Initial commit for project two",
    branch: "dev",
    time: new Date().toLocaleString(),
    type: "node",
    status: "completed",
  },
  {
    id: "789fdkjdfkljdklsjd",
    projectId: "project3",
    name: "Frontend Redesign",
    userId: "345678912",
    repoUrl: "https://github.com/user789/Frontend.git",
    createdAt: new Date('2021-01-02T12:00:00Z'),
    updatedAt: new Date('2021-01-02T12:00:00Z'),
    image: "",
    commit: "Added new header styles",
    branch: "feature/header",
    time: new Date().toLocaleString(),
    type: "react",
    status: "in-progress",
  },
  {
    id: "321kljdfkljsdklfjsk",
    projectId: "project4",
    name: "Backend API",
    userId: "987654321",
    repoUrl: "https://github.com/backenduser/api-project.git",
    createdAt: new Date('2022-01-02T12:00:00Z'),
    updatedAt: new Date('2022-01-02T12:00:00Z'),
    image: "",
    commit: "Added authentication middleware",
    branch: "main",
    time: new Date().toLocaleString(),
    type: "express",
    status: "deploying",
  },
  {
    id: "654kjdflksdflkjsdlk",
    projectId: "project5",
    name: "Database Schema",
    userId: "159357456",
    repoUrl: "https://github.com/dbuser/schema.git",
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "",
    commit: "Added tables for user management",
    branch: "feature/db",
    time: new Date().toLocaleString(),
    type: "database",
    status: "completed",
  },
  {
    id: "987sdlkfjsdlkfjsldk",
    projectId: "project6",
    name: "E-commerce Platform",
    userId: "456123789",
    repoUrl: "https://github.com/ecommerce-dev/shop.git",
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "",
    commit: "Setup payment gateway integration",
    branch: "main",
    time: new Date().toLocaleString(),
    type: "full-stack",
    status: "in-progress",
  },
  {
    id: "111skldjflksdjfklds",
    projectId: "project7",
    name: "Mobile App Development",
    userId: "789456123",
    repoUrl: "https://github.com/mobiledev123/app.git",
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "",
    commit: "Added splash screen functionality",
    branch: "feature/splash-screen",
    time: new Date().toLocaleString(),
    type: "react-native",
    status: "testing",
  },
  {
    id: "222skldfjksdljfsdkl",
    projectId: "project8",
    name: "Portfolio Website",
    userId: "963852741",
    repoUrl: "https://github.com/portfolio/website.git",
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "",
    commit: "Deployed portfolio version 1.0",
    branch: "main",
    time: new Date().toLocaleString(),
    type: "static",
    status: "completed",
  },
  {
    id: "333sldkfjsldkfjsdklj",
    projectId: "project9",
    name: "AI Chatbot",
    userId: "741852963",
    repoUrl: "https://github.com/ai-bot/chat.git",
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "",
    commit: "Trained model with new dataset",
    branch: "feature/ml",
    time: new Date().toLocaleString(),
    type: "machine-learning",
    status: "in-progress",
  },
  {
    id: "444skldfjlsdkjflsdkj",
    projectId: "project10",
    name: "DevOps Pipeline",
    userId: "852963741",
    repoUrl: "https://github.com/devops/pipeline.git",
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "",
    commit: "Automated deployment setup",
    branch: "feature/ci-cd",
    time: new Date().toLocaleString(),
    type: "devops",
    status: "deploying",
  },
];

export const useProjectStore = create<State & Action>((set) => ({
  projects: values,
  filteredProjects: values,

  setProjects: (projects) =>
    set(() => ({
      projects,
      filteredProjects: projects, 
    })),

  setFilteredProjects: (projects) => set(() => ({ filteredProjects: projects })),

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
      filteredProjects: [project, ...state.filteredProjects],
    })),

  updateProject: (projectId, updatedData) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.projectId === projectId
          ? { ...project, ...updatedData, updatedAt: new Date() }
          : project
      ),
      filteredProjects: state.filteredProjects.map((project) =>
        project.projectId === projectId
          ? { ...project, ...updatedData, updatedAt: new Date() }
          : project
      ),
    })),

  deleteProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter(
        (project) => project.projectId !== projectId
      ),
      filteredProjects: state.filteredProjects.filter(
        (project) => project.projectId !== projectId
      ),
    })),
}));
