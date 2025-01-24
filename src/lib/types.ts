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


export interface NotificationTpes {
  id: string;
  value: string;
  userId: string;
  createdAt : Date;
  isRead : boolean
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}
