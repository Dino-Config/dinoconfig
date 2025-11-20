import { createContext, useEffect, useState, ReactNode } from "react";
import axios from "./axios-interceptor";
import { environment } from "../../environments";
import { tokenRenewalService } from "./token-renewal.service";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  refreshAuth: (forceCheck?: boolean) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  loading: false,
  refreshAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null means "unknown yet"
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async (forceCheck: boolean = false) => {
    // Check if we're on a public route
    const publicRoutes = ['/signin', '/signup', '/verify-email'];
    const isPublicRoute = typeof window !== 'undefined' && publicRoutes.some(route => window.location.pathname.includes(route));
    
    // Skip validate call on public routes (signin/signup) unless forceCheck is true
    if (isPublicRoute && !forceCheck) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    try {
      await axios.get(`${environment.apiUrl}/auth/validate`, { withCredentials: true, timeout: 10000 });
      setIsAuthenticated(true);
    } catch (error: any) {
      // Only try token refresh on protected routes or when forceCheck is true
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

  // Always render children, even during loading, so public pages can render
  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuthenticated ?? false, loading, refreshAuth: (forceCheck) => checkAuthStatus(forceCheck) }}>
      {children}
    </AuthContext.Provider>
  );
};
