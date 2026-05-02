import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { QueryProvider } from './context/QueryProvider';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast/ToastContext';
import { ConfirmProvider } from './components/common/ConfirmDialog/ConfirmDialog';
import ShortcutsHelp from './components/common/ShortcutsHelp/ShortcutsHelp';
import './styles/main.scss';
import router from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <RouterProvider router={router} />
              <ShortcutsHelp />
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);
