import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Sidebar, MobileNav } from './index';
import { Navbar } from './Navbar';
import { ToastContainer } from '../ui/Toast';

export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}

export function PublicRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Outlet />
      <ToastContainer />
    </>
  );
}