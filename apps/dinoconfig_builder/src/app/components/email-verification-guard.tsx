import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../auth/user-context";
import Spinner from "./Spinner";

export const EmailVerificationGuard = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || location.pathname === '/verify-email') {
      return;
    }

    if (user && !user.emailVerified) {
      navigate('/verify-email', { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  // Show spinner while loading
  if (loading) {
    return <Spinner text="Loading..." size="medium" />;
  }

  if (user && !user.emailVerified) {
    return <Spinner text="Redirecting..." size="medium" />;
  }

  return children;
};

