import { JSX, useContext, useEffect } from "react";
import { AuthContext } from "../auth/auth-provider";
import { environment } from "../../environments";
import { Spinner } from "../components";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading, refreshAuth } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Try to refresh auth before redirecting
      refreshAuth().then(() => {
        // If still not authenticated after refresh, redirect
        if (!isAuthenticated) {
          window.location.href = environment.homeUrl;
        }
      });
    }
  }, [loading, isAuthenticated, refreshAuth]);

  if (loading) {
    return <Spinner text="Loading..." size="medium" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};
