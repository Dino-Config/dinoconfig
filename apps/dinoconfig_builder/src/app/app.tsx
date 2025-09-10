import ConfigBuilder from "./config-builder";
import { AuthProvider } from "./auth/auth-provider";
import { ProtectedRoute } from "./route/protected-route";

export function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ConfigBuilder companyId="1" />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
