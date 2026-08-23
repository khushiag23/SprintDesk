interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;
type Listener = (toasts: Toast[]) => void;
const listeners: Listener[] = [];
let toasts: Toast[] = [];

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function useToast() {
  return {
    subscribe: (listener: Listener) => {
      listeners.push(listener);
      listener([...toasts]);
      return () => {
        const idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },
    toast: {
      success: (message: string) => {
        const id = ++toastId;
        toasts = [...toasts, { id, message, type: 'success' }];
        notify();
        setTimeout(() => {
          toasts = toasts.filter((t) => t.id !== id);
          notify();
        }, 4000);
      },
      error: (message: string) => {
        const id = ++toastId;
        toasts = [...toasts, { id, message, type: 'error' }];
        notify();
        setTimeout(() => {
          toasts = toasts.filter((t) => t.id !== id);
          notify();
        }, 4000);
      },
      info: (message: string) => {
        const id = ++toastId;
        toasts = [...toasts, { id, message, type: 'info' }];
        notify();
        setTimeout(() => {
          toasts = toasts.filter((t) => t.id !== id);
          notify();
        }, 4000);
      },
    },
  };
}

export function getToastState(): Toast[] {
  return toasts;
}

export function clearToasts(): void {
  toasts = [];
  toastId = 0;
}