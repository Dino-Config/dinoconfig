import { JSX, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/auth-provider";
import { Spinner } from "../components";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading, refreshAuth } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Try to refresh auth before redirecting
      refreshAuth().then(() => {
        // If still not authenticated after refresh, redirect will happen via Navigate
      });
    }
  }, [loading, isAuthenticated, refreshAuth]);

  if (loading) {
    return <Spinner text="Loading..." size="medium" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};
