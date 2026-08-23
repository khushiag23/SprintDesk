import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, User, TaskStatus } from '../types';
import { taskService } from '../services/api';

interface BoardState {
  tasks: Record<TaskStatus, Task[]>;
  loading: boolean;
  error: string | null;
  undoStack: { tasks: Record<TaskStatus, Task[]> } | null;
  fetchTasks: () => Promise<void>;
  moveTask: (taskId: number, newStatus: TaskStatus, newIndex: number) => void;
  reorderTask: (status: TaskStatus, fromIndex: number, toIndex: number) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number, status: TaskStatus) => Promise<void>;
  addComment: (taskId: number, text: string, author: string) => Promise<void>;
  undoLastMove: () => void;
}

const EMPTY: Record<TaskStatus, Task[]> = {
  backlog: [],
  'in-progress': [],
  review: [],
  done: [],
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: { ...EMPTY },
      loading: false,
      error: null,
      undoStack: null,

      fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
          const all = await taskService.getAll();
          const grouped: Record<TaskStatus, Task[]> = { backlog: [], 'in-progress': [], review: [], done: [] };
          all.forEach(t => {
            if (grouped[t.status]) grouped[t.status].push(t);
            else grouped.backlog.push(t);
          });
          set({ tasks: grouped, loading: false });
        } catch {
          set({ error: 'Failed to load tasks', loading: false });
        }
      },

      moveTask: (taskId, newStatus, newIndex) => {
        const { tasks } = get();
        const snapshot = { tasks: JSON.parse(JSON.stringify(tasks)) };
        let movedTask: Task | undefined;
        for (const status of Object.keys(tasks) as TaskStatus[]) {
          const idx = tasks[status].findIndex(t => t.id === taskId);
          if (idx !== -1) {
            movedTask = tasks[status].splice(idx, 1)[0];
            break;
          }
        }
        if (!movedTask) return;
        movedTask.status = newStatus;
        if (newStatus === 'done' && !movedTask.completedAt) {
          movedTask.completedAt = new Date().toISOString().split('T')[0];
        }
        tasks[newStatus].splice(newIndex, 0, movedTask);
        set({ tasks: { ...tasks }, undoStack: snapshot });
      },

      reorderTask: (status, fromIndex, toIndex) => {
        const { tasks } = get();
        const snapshot = { tasks: JSON.parse(JSON.stringify(tasks)) };
        const [moved] = tasks[status].splice(fromIndex, 1);
        tasks[status].splice(toIndex, 0, moved);
        set({ tasks: { ...tasks }, undoStack: snapshot });
      },

      addTask: async (taskData) => {
        const task = await taskService.create(taskData);
        const { tasks } = get();
        tasks[task.status].push(task);
        set({ tasks: { ...tasks } });
      },

      updateTask: async (task) => {
        await taskService.update(task);
        const { tasks } = get();
        for (const status of Object.keys(tasks) as TaskStatus[]) {
          const idx = tasks[status].findIndex(t => t.id === task.id);
          if (idx !== -1) {
            tasks[status][idx] = task;
            break;
          }
        }
        set({ tasks: { ...tasks } });
      },

      deleteTask: async (taskId, status) => {
        await taskService.delete(taskId);
        const { tasks } = get();
        tasks[status] = tasks[status].filter(t => t.id !== taskId);
        set({ tasks: { ...tasks } });
      },

      addComment: async (taskId, text, author) => {
        const comment = await taskService.addComment(taskId, { author, text });
        const { tasks } = get();
        for (const status of Object.keys(tasks) as TaskStatus[]) {
          const task = tasks[status].find(t => t.id === taskId);
          if (task) {
            task.comments.push(comment);
            break;
          }
        }
        set({ tasks: { ...tasks } });
      },

      undoLastMove: () => {
        const { undoStack } = get();
        if (undoStack) {
          set({ tasks: undoStack.tasks, undoStack: null });
        }
      },
    }),
    { name: 'sprintdesk-board' }
  )
);

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user) =>
        set({
          user,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'sprintdesk-auth',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user?.id ? { id: state.user.id, username: state.user.username, email: state.user.email, firstName: state.user.firstName, lastName: state.user.lastName, image: state.user.image, gender: state.user.gender } : null,
      }),
    }
  )
);

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () =>
        set((state) => {
          const next = !state.isDark;
          document.documentElement.classList.toggle('dark', next);
          return { isDark: next };
        }),
    }),
    { name: 'sprintdesk-theme' }
  )
);

interface NotificationState {
  notifications: { id: number; title: string; body: string; read: boolean; createdAt: string; userId: number }[];
  unreadCount: number;
  setNotifications: (notifications: { id: number; title: string; body: string; read: boolean; createdAt: string; userId: number }[]) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  addNotifications: (newNotifs: { id: number; title: string; body: string; read: boolean; createdAt: string; userId: number }[]) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      setNotifications: (notifications) =>
        set({ notifications, unreadCount: notifications.filter((n) => !n.read).length }),

      markAsRead: (id) =>
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      addNotifications: (newNotifs) =>
        set((state) => {
          const existingIds = new Set(state.notifications.map((n) => n.id));
          const unique = newNotifs.filter((n) => !existingIds.has(n.id));
          if (unique.length === 0) return state;
          const notifications = [...unique, ...state.notifications].slice(0, 100);
          return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
        }),
    }),
    { name: 'sprintdesk-notifications' }
  )
);