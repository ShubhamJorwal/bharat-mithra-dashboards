import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface RouteProps {
  children: ReactNode;
}

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("authToken");
  return !!token;
};

// Protected Route - Only accessible when logged in
// Redirects to /login if not authenticated
const ProtectedRoute = ({ children }: RouteProps) => {
  // For now, bypass auth check for testing (set to true)
  const bypassAuth = true;

  if (!bypassAuth && !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Only Route - Only accessible when NOT logged in
// Redirects to / (home) if already authenticated
const PublicOnlyRoute = ({ children }: RouteProps) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AuthRoutes = {
  ProtectedRoute,
  PublicOnlyRoute,
};

export default AuthRoutes;
