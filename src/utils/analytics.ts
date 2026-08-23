import type { Task, TaskStatus, AnalyticsData } from '../types';

export function computeAnalytics(tasksByStatus: Record<TaskStatus, Task[]>): AnalyticsData {
  const sprintVelocity = [
    { sprint: 'Sprint 1', completed: tasksByStatus.done.filter(t => t.sprintId === 1).length },
    { sprint: 'Sprint 2', completed: tasksByStatus.done.filter(t => t.sprintId === 2).length },
  ];

  const taskStatus = [
    { name: 'Backlog', value: tasksByStatus.backlog.length },
    { name: 'In Progress', value: tasksByStatus['in-progress'].length },
    { name: 'Review', value: tasksByStatus.review.length },
    { name: 'Done', value: tasksByStatus.done.length },
  ];

  const priorityOrder = ['critical', 'high', 'medium', 'low'];
  const priorityBreakdown = priorityOrder.map((p) => ({
    priority: p,
    backlog: tasksByStatus.backlog.filter((t) => t.priority === p).length,
    inProgress: tasksByStatus['in-progress'].filter((t) => t.priority === p).length,
    review: tasksByStatus.review.filter((t) => t.priority === p).length,
    done: tasksByStatus.done.filter((t) => t.priority === p).length,
  }));

  const completedByDate: Record<string, number> = {};
  tasksByStatus.done.forEach((t) => {
    if (t.completedAt) {
      completedByDate[t.completedAt] = (completedByDate[t.completedAt] || 0) + 1;
    }
  });
  const dates = Object.keys(completedByDate).sort();
  const completionTrend = dates.map((date) => ({
    date,
    completed: completedByDate[date],
  }));

  return { sprintVelocity, taskStatus, priorityBreakdown, completionTrend };
}