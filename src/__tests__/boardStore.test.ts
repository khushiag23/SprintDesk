import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '../store';

describe('Board Store', () => {
  beforeEach(() => {
    useBoardStore.setState({
      tasks: {
        backlog: [],
        'in-progress': [],
        review: [],
        done: [],
      },
      undoStack: null,
    });
  });

  it('should add a task to backlog', async () => {
    const taskData = {
      title: 'Test task',
      description: 'Test description',
      priority: 'high' as const,
      assignee: 'Alice',
      dueDate: '2025-09-01',
      status: 'backlog' as const,
      sprintId: 1,
    };

    const { taskService } = await import('../services/api');
    const originalCreate = taskService.create;
    taskService.create = async () => ({
      id: 999,
      ...taskData,
      createdAt: '2025-08-23',
      comments: [],
    });

    await useBoardStore.getState().addTask(taskData);
    const state = useBoardStore.getState();
    expect(state.tasks.backlog).toHaveLength(1);
    expect(state.tasks.backlog[0].title).toBe('Test task');

    taskService.create = originalCreate;
  });

  it('should move a task between columns', () => {
    useBoardStore.setState({
      tasks: {
        backlog: [{
          id: 1, title: 'Task 1', description: '', priority: 'medium' as const,
          assignee: 'Bob', dueDate: '2025-09-01', createdAt: '2025-08-23',
          status: 'backlog' as const, sprintId: 1, comments: [],
        }],
        'in-progress': [],
        review: [],
        done: [],
      },
    });

    useBoardStore.getState().moveTask(1, 'in-progress', 0);
    const state = useBoardStore.getState();
    expect(state.tasks.backlog).toHaveLength(0);
    expect(state.tasks['in-progress']).toHaveLength(1);
    expect(state.tasks['in-progress'][0].id).toBe(1);
    expect(state.tasks['in-progress'][0].status).toBe('in-progress');
  });

  it('should delete a task', async () => {
    useBoardStore.setState({
      tasks: {
        backlog: [{
          id: 2, title: 'Task 2', description: '', priority: 'low' as const,
          assignee: 'Carol', dueDate: '2025-09-01', createdAt: '2025-08-23',
          status: 'backlog' as const, sprintId: 1, comments: [],
        }],
        'in-progress': [],
        review: [],
        done: [],
      },
    });

    const { taskService } = await import('../services/api');
    const originalDelete = taskService.delete;
    taskService.delete = async () => {};

    await useBoardStore.getState().deleteTask(2, 'backlog');
    const state = useBoardStore.getState();
    expect(state.tasks.backlog).toHaveLength(0);

    taskService.delete = originalDelete;
  });

  it('should reorder tasks within the same column', () => {
    useBoardStore.setState({
      tasks: {
        backlog: [
          { id: 1, title: 'A', description: '', priority: 'low' as const, assignee: '', dueDate: '', createdAt: '', status: 'backlog' as const, sprintId: 1, comments: [] },
          { id: 2, title: 'B', description: '', priority: 'low' as const, assignee: '', dueDate: '', createdAt: '', status: 'backlog' as const, sprintId: 1, comments: [] },
        ],
        'in-progress': [],
        review: [],
        done: [],
      },
    });

    useBoardStore.getState().reorderTask('backlog', 0, 1);
    const state = useBoardStore.getState();
    expect(state.tasks.backlog[0].id).toBe(2);
    expect(state.tasks.backlog[1].id).toBe(1);
  });

  it('should support undo after move', () => {
    useBoardStore.setState({
      tasks: {
        backlog: [{
          id: 1, title: 'Task', description: '', priority: 'medium' as const,
          assignee: '', dueDate: '', createdAt: '', status: 'backlog' as const, sprintId: 1, comments: [],
        }],
        'in-progress': [],
        review: [],
        done: [],
      },
    });

    useBoardStore.getState().moveTask(1, 'done', 0);
    expect(useBoardStore.getState().tasks.backlog).toHaveLength(0);

    useBoardStore.getState().undoLastMove();
    expect(useBoardStore.getState().tasks.backlog).toHaveLength(1);
  });
});