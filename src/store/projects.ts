import { create } from 'zustand';

type Project = {
  id: string;
  name: string;
  projectId: string;
  userId: string;
  repoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  status: string;
  logs: Array<unknown>; 
};

type State = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
};

type Action = {
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updatedData: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
};

export const useProjectStore = create<State & Action>((set) => ({
  projects: [],
  
  setProjects: (projects) => set(() => ({ projects })),
  
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),
  
  updateProject: (projectId, updatedData) =>
    set((state) => ({
      projects: state.projects.map((project) =>
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
    })),
}));
