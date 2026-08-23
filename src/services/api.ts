import type { Task, Comment, Sprint, Notification, User } from '../types';

const MOCK_DATA_URL = '/mock-data.json';

let mockData: Task[] | null = null;

async function getMockData(): Promise<Task[]> {
  if (mockData) return mockData;
  const res = await fetch(MOCK_DATA_URL);
  mockData = await res.json();
  return mockData!;
}

export const taskService = {
  async getAll(): Promise<Task[]> {
    return getMockData();
  },

  async getById(id: number): Promise<Task | undefined> {
    const tasks = await getMockData();
    return tasks.find(t => t.id === id);
  },

  async update(updated: Task): Promise<Task> {
    const tasks = await getMockData();
    const idx = tasks.findIndex(t => t.id === updated.id);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx] = updated;
    return updated;
  },

  async create(task: Omit<Task, 'id' | 'createdAt' | 'comments'>): Promise<Task> {
    const tasks = await getMockData();
    const newTask: Task = {
      ...task,
      id: Math.max(...tasks.map(t => t.id)) + 1,
      createdAt: new Date().toISOString().split('T')[0],
      comments: [],
    };
    tasks.push(newTask);
    return newTask;
  },

  async delete(id: number): Promise<void> {
    const tasks = await getMockData();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) tasks.splice(idx, 1);
  },

  async addComment(taskId: number, comment: Omit<Comment, 'id' | 'taskId' | 'createdAt'>): Promise<Comment> {
    const tasks = await getMockData();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    const newComment: Comment = {
      ...comment,
      id: Date.now(),
      taskId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    task.comments.push(newComment);
    return newComment;
  },
};

export const sprintService = {
  async getAll(): Promise<Sprint[]> {
    return [
      { id: 1, name: 'Sprint 1 — Foundation', startDate: '2025-07-14', endDate: '2025-08-15', isActive: false },
      { id: 2, name: 'Sprint 2 — Enhancement', startDate: '2025-08-18', endDate: '2025-09-26', isActive: true },
    ];
  },
};

export const authService = {
  async login(username: string, password: string): Promise<User> {
    const res = await fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, expiresInMins: 30 }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await fetch('https://dummyjson.com/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token, expiresInMins: 30 }),
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async getCurrentUser(token: string): Promise<User> {
    const res = await fetch('https://dummyjson.com/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },
};

export const notificationService = {
  async getLatest(): Promise<Notification[]> {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const posts = await res.json();
    return posts.map((p: { id: number; title: string; body: string; userId: number }) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      read: false,
      createdAt: new Date().toISOString(),
      userId: p.userId,
    }));
  },
};