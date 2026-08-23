import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from '@dnd-kit/core';
import { useBoardStore } from '../store';
import type { Task, TaskStatus } from '../types';
import { KanbanColumn } from '../components/board/KanbanColumn';
import { TaskDetailDrawer } from '../components/board/TaskDetailDrawer';
import { CreateTaskModal } from '../components/board/CreateTaskModal';
import { SortableTaskCard } from '../components/board/SortableTaskCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BoardSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';

export function BoardPage() {
  const { tasks, fetchTasks, loading, moveTask, reorderTask, deleteTask, undoLastMove, undoStack } = useBoardStore();
  const { toast } = useToast();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; status: TaskStatus } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const findTaskStatus = useCallback((id: number): TaskStatus | undefined => {
    for (const [status, list] of Object.entries(tasks)) {
      if (list.some(t => t.id === id)) return status as TaskStatus;
    }
    return undefined;
  }, [tasks]);

  const findTask = useCallback((id: number): Task | undefined => {
    for (const list of Object.values(tasks)) {
      const found = list.find(t => t.id === id);
      if (found) return found;
    }
    return undefined;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTask(Number(event.active.id));
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = Number(active.id);
    const overId = over.id.toString();
    const activeStatus = findTaskStatus(activeId);
    const overStatus = (tasks as Record<string, unknown>)[overId] ? overId as TaskStatus : findTaskStatus(Number(over.id));
    if (!activeStatus || !overStatus || activeStatus === overStatus) return;
    const overIndex = overStatus === findTaskStatus(Number(over.id))
      ? tasks[overStatus].findIndex(t => t.id === Number(over.id))
      : tasks[overStatus].length;
    moveTask(activeId, overStatus, overIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const activeId = Number(active.id);
    const activeStatus = findTaskStatus(activeId);
    const overStatus = findTaskStatus(Number(over.id));
    if (activeStatus && overStatus && activeStatus === overStatus) {
      const oldIndex = tasks[activeStatus].findIndex(t => t.id === activeId);
      const newIndex = tasks[activeStatus].findIndex(t => t.id === Number(over.id));
      if (oldIndex !== newIndex) {
        reorderTask(activeStatus, oldIndex, newIndex);
      }
    }
  };

  const handleDelete = async (taskId: number) => {
    const status = findTaskStatus(taskId);
    if (status) setDeleteConfirm({ id: taskId, status });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteTask(deleteConfirm.id, deleteConfirm.status);
    toast.success('Task deleted');
    setDeleteConfirm(null);
  };

  if (loading) {
    return <div className="p-4 lg:p-6"><BoardSkeleton /></div>;
  }

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sprint Board</h1>
          {undoStack && (
            <Button variant="ghost" size="sm" onClick={undoLastMove}>
              Undo
            </Button>
          )}
        </div>
        <Button onClick={() => setShowCreate(true)}>
          + New Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasks[col.id]}
              onTaskClick={setSelectedTask}
              onDeleteTask={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90 shadow-2xl">
              <SortableTaskCard task={activeTask} onClick={() => {}} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailDrawer task={selectedTask} open={!!selectedTask} onClose={() => setSelectedTask(null)} />
      <CreateTaskModal open={showCreate} onClose={() => setShowCreate(false)} />

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}