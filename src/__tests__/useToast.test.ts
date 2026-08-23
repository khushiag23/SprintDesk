import { describe, it, expect, beforeEach } from 'vitest';
import { useToast, clearToasts } from '../hooks/useToast';

describe('useToast', () => {
  beforeEach(() => {
    clearToasts();
  });

  it('should create a toast and emit to subscribers', () => {
    const { toast, subscribe } = useToast();
    const items: Array<Array<{ id: number; message: string; type: string }>> = [];
    const unsub = subscribe((t) => items.push(t));
    toast.success('Test success');
    expect(items.length).toBeGreaterThan(0);
    const latest = items[items.length - 1];
    expect(latest.some((t) => t.message === 'Test success' && t.type === 'success')).toBe(true);
    unsub();
  });

  it('should create error toasts', () => {
    const { toast, subscribe } = useToast();
    const items: Array<Array<{ id: number; message: string; type: string }>> = [];
    const unsub = subscribe((t) => items.push(t));
    toast.error('Test error');
    const latest = items[items.length - 1];
    expect(latest.some((t) => t.message === 'Test error' && t.type === 'error')).toBe(true);
    unsub();
  });

  it('should create info toasts', () => {
    const { toast, subscribe } = useToast();
    const items: Array<Array<{ id: number; message: string; type: string }>> = [];
    const unsub = subscribe((t) => items.push(t));
    toast.info('Test info');
    const latest = items[items.length - 1];
    expect(latest.some((t) => t.message === 'Test info' && t.type === 'info')).toBe(true);
    unsub();
  });

  it('should stop notifying after unsubscribe', () => {
    const { toast, subscribe } = useToast();
    const items: Array<Array<{ id: number; message: string; type: string }>> = [];
    const unsub = subscribe((t) => items.push(t));
    unsub();
    toast.success('After unsub');
    // The subscriber might have been called when subscribing, so check last item wasn't added after unsub
    const lastCount = items.length;
    toast.success('Again after unsub');
    expect(items.length).toBe(lastCount);
  });
});