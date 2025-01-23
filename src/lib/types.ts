export interface ProjectCardTypes {
  id: string;
  projectId: string;
  name: string;
  userId: string;
  repoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  commit?: string;
  branch?: string;
  views?: number;
  time: string;
  type: string;
  status: string;
  logs?: Record<string | number | symbol, undefined>[];
}