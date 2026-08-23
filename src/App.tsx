import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore, useThemeStore } from './store';
import { authService } from './services/api';
import { ProtectedLayout, PublicRoute } from './components/layout/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BoardPage = lazy(() => import('./pages/BoardPage').then(m => ({ default: m.BoardPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setTokens, login, setLoading, refreshToken: storedRefresh, isAuthenticated } = useAuthStore();

  useEffect(() => {
    async function init() {
      if (!storedRefresh) {
        setLoading(false);
        return;
      }
      try {
        const tokens = await authService.refreshToken(storedRefresh);
        setTokens(tokens.accessToken, tokens.refreshToken);
        const user = await authService.getCurrentUser(tokens.accessToken);
        login({ ...user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      } catch {
        setLoading(false);
      }
    }
    // Only run if not already authenticated
    if (!isAuthenticated) {
      init();
    } else {
      setLoading(false);
    }
  }, []);

  return <>{children}</>;
}

export function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/board" element={<BoardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}