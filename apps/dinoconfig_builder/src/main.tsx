import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';
import { AuthProvider } from './app/auth/auth-provider';
import { UserProvider } from './app/auth/user-context';
import { ProtectedRoute } from './app/route/protected-route';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <AuthProvider>
      <UserProvider>
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      </UserProvider>
    </AuthProvider>
  </StrictMode>
);
