import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface RouteProps {
  children: ReactNode;
}

// While the auth context is still resolving the existing token, render
// nothing (a brief blank screen). Once `initialized` is true we know
// whether the user is logged in or not.
const AuthInit = ({ children }: RouteProps) => {
  const { initialized } = useAuth();
  if (!initialized) return <div style={{ minHeight: "100vh" }} />;
  return <>{children}</>;
};

// Protected Route — only accessible when logged in.
// Bounces unauthenticated visitors to /login and remembers where they
// were trying to go so we can redirect back after login.
const ProtectedRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, initialized } = useAuth();
  const location = useLocation();
  if (!initialized) return <div style={{ minHeight: "100vh" }} />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <AuthInit>{children}</AuthInit>;
};

// Public Only Route — only accessible when NOT logged in.
// Bounces logged-in users to "/" (or wherever they were headed before login).
const PublicOnlyRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, initialized } = useAuth();
  if (!initialized) return <div style={{ minHeight: "100vh" }} />;
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AuthRoutes = {
  ProtectedRoute,
  PublicOnlyRoute,
};

export default AuthRoutes;
