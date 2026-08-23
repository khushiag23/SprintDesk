import { useState } from 'react';
import type { Task } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { formatDate, cn, getPriorityColor } from '../../utils/cn';
import { useBoardStore } from '../../store';
import { useToast } from '../../hooks/useToast';

interface TaskDetailDrawerProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export function TaskDetailDrawer({ task, open, onClose }: TaskDetailDrawerProps) {
  const { updateTask, addComment } = useBoardStore();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState(task?.priority || 'medium');

  if (!task) return null;

  const handleSave = async () => {
    await updateTask({ ...task, title: editTitle, description: editDesc, priority: editPriority as Task['priority'] });
    setEditing(false);
    toast.success('Task updated');
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    await addComment(task.id, comment.trim(), 'Current User');
    setComment('');
    toast.success('Comment added');
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Task' : task.title}>
      <div className="space-y-4">
        {editing ? (
          <div className="space-y-3">
            <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <Select
              label="Priority"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Task['priority'])}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium', getPriorityColor(task.priority))}>
                {task.priority}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{task.status}</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400 dark:text-slate-500">Assignee</span>
                <p className="font-medium text-slate-900 dark:text-white">{task.assignee}</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Due Date</span>
                <p className="font-medium text-slate-900 dark:text-white">{formatDate(task.dueDate)}</p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => { setEditing(true); setEditTitle(task.title); setEditDesc(task.description); setEditPriority(task.priority); }}>
              Edit Task
            </Button>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Comments ({task.comments.length})</h4>
              <div className="space-y-3 max-h-40 overflow-y-auto mb-3">
                {task.comments.length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-slate-500">No comments yet</p>
                )}
                {task.comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.author}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>Send</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}