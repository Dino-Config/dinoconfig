import { createContext, useEffect, useState, ReactNode } from "react";
import axios from "./axios-interceptor";
import { environment } from "../../environments";
import { tokenRenewalService } from "./token-renewal.service";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  loading: false,
  refreshAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null means "unknown yet"
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      await axios.get(`${environment.apiUrl}/auth/validate`, { withCredentials: true, timeout: 10000 });
      setIsAuthenticated(true);
    } catch (error: any) {
      const renewed = await tokenRenewalService.forceRenewal();
      if (renewed) {
        try {
          await axios.get(`${environment.apiUrl}/auth/validate`, { withCredentials: true, timeout: 10000 });
          setIsAuthenticated(true);
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (loading || isAuthenticated === null) {
    // Keep children unmounted until we know the auth status
    return null; 
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, refreshAuth: checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
