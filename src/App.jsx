import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './routes/AppRouter';
import { getMe } from './services/authService';
import useAuthStore from './stores/useAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

/**
 * Root application component.
 * Wraps the app in BrowserRouter and React Query provider.
 */
export default function App() {
  const token = useAuthStore((state) => state.token);
  const authStatus = useAuthStore((state) => state.authStatus);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const markAnonymous = useAuthStore((state) => state.markAnonymous);

  useEffect(() => {
    if (!token || authStatus !== 'loading') return;

    let active = true;
    getMe()
      .then((user) => {
        if (active) restoreSession(user);
      })
      .catch(() => {
        if (active) markAnonymous();
      });

    return () => {
      active = false;
    };
  }, [token, authStatus, restoreSession, markAnonymous]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
