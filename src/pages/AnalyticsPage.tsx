import { SprintVelocityChart, TaskStatusPieChart, PriorityBreakdownChart, CompletionTrendChart } from '../components/analytics/Charts';

export function AnalyticsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sprint metrics and task insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SprintVelocityChart />
        <TaskStatusPieChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityBreakdownChart />
        <CompletionTrendChart />
      </div>
    </div>
  );
}