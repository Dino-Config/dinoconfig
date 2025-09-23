import { createContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { environment } from "../../environments/environment";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  loading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${environment.apiUrl}/auth/validate`, { withCredentials: true })

      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};