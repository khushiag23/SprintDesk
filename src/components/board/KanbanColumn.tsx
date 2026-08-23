import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../types';
import { SortableTaskCard } from './SortableTaskCard';
import { cn } from '../../utils/cn';

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

const statusColors: Record<TaskStatus, string> = {
  backlog: 'border-t-slate-400',
  'in-progress': 'border-t-blue-500',
  review: 'border-t-amber-500',
  done: 'border-t-green-500',
};

export function KanbanColumn({ column, tasks, onTaskClick, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      className={cn(
        'flex-1 min-w-[280px] max-w-[350px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 border-t-4 bg-slate-50/50 dark:bg-slate-800/20',
        statusColors[column.id]
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{column.title}</h3>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400">
            {tasks.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 px-3 pb-3 space-y-2 min-h-[200px] transition-colors rounded-b-xl',
          isOver && 'bg-primary-50/50 dark:bg-primary-900/10'
        )}
      >
        <SortableContext items={tasks.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}