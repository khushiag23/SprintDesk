import { useBoardStore, useAuthStore } from '../store';
import { CardSkeleton } from '../components/ui/Skeleton';
import { SprintVelocityChart, TaskStatusPieChart } from '../components/analytics/Charts';

export function DashboardPage() {
  const { tasks, loading } = useBoardStore();
  const user = useAuthStore((s) => s.user);

  const totalTasks = Object.values(tasks).flat().length;
  const doneTasks = tasks.done.length;
  const inProgressTasks = tasks['in-progress'].length;

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, {user?.firstName || 'User'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Tasks</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressTasks}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{doneTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SprintVelocityChart />
        <TaskStatusPieChart />
      </div>
    </div>
  );
}