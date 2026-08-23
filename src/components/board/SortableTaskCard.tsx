import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { cn, getPriorityColor, formatDate } from '../../utils/cn';

interface SortableTaskCardProps {
  task: Task;
  onClick: () => void;
  onDelete: () => void;
}

export function SortableTaskCard({ task, onClick, onDelete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg'
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">{task.title}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          aria-label={`Delete ${task.title}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', getPriorityColor(task.priority))}>
          {task.priority}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{task.assignee}</span>
        {task.dueDate && (
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{formatDate(task.dueDate)}</span>
        )}
      </div>
    </div>
  );
}