export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  sprintId: number;
  comments: Comment[];
}

export interface Comment {
  id: number;
  taskId: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  userId: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done';

export interface AnalyticsData {
  sprintVelocity: { sprint: string; completed: number }[];
  taskStatus: { name: string; value: number }[];
  priorityBreakdown: { priority: string; backlog: number; inProgress: number; review: number; done: number }[];
  completionTrend: { date: string; completed: number }[];
}

export interface Column {
  id: TaskStatus;
  title: string;
}

export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];