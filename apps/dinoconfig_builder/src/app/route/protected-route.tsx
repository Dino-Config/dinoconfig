import { JSX, useContext, useEffect } from "react";
import { AuthContext } from "../auth/auth-provider";
import { environment } from "../../environments";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = environment.homeUrl;
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};
