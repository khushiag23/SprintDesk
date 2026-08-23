import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { useMemo } from 'react';
import { useBoardStore } from '../../store';
import { computeAnalytics } from '../../utils/analytics';

const COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#22c55e'];

export function SprintVelocityChart() {
  const tasks = useBoardStore((s) => s.tasks);
  const data = useMemo(() => computeAnalytics(tasks).sprintVelocity, [tasks]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Sprint Velocity</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="sprint" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TaskStatusPieChart() {
  const tasks = useBoardStore((s) => s.tasks);
  const data = useMemo(() => computeAnalytics(tasks).taskStatus, [tasks]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Task Status Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, idx) => (
              <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityBreakdownChart() {
  const tasks = useBoardStore((s) => s.tasks);
  const data = useMemo(() => computeAnalytics(tasks).priorityBreakdown, [tasks]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Priority Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="backlog" stackId="a" fill="#94a3b8" animationDuration={600} />
          <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" animationDuration={600} />
          <Bar dataKey="review" stackId="a" fill="#f59e0b" animationDuration={600} />
          <Bar dataKey="done" stackId="a" fill="#22c55e" animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompletionTrendChart() {
  const tasks = useBoardStore((s) => s.tasks);
  const data = useMemo(() => computeAnalytics(tasks).completionTrend, [tasks]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Completion Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data.length > 0 ? data : [{ date: 'No data', completed: 0 }]}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} animationDuration={1000} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}