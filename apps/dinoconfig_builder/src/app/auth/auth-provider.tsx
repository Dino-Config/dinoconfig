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
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      await axios.get(`${environment.apiUrl}/auth/validate`, { 
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      });
      setIsAuthenticated(true);
    } catch (error: any) {
      // If validation fails, try to renew the token
      console.log('Auth validation failed, attempting token renewal...');
      const renewed = await tokenRenewalService.forceRenewal();
      if (renewed) {
        // Try validation again after renewal
        try {
          await axios.get(`${environment.apiUrl}/auth/validate`, { 
            withCredentials: true,
            timeout: 10000
          });
          setIsAuthenticated(true);
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      // Note: Redirect is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};