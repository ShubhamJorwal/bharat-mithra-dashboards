import { useEffect } from "react";
import { createBrowserRouter, useLocation } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import AuthRoutes from "./AuthRoutes";
import Layout from "../components/Layout/Layout";
import Dashboard from "../views/Dashboard/Dashboard";

// Auth Pages
import Login from "../views/Auth/Login/Login";
import ForgetPassword from "../views/Auth/ForgetPassword/ForgetPassword";
import EnterOTP from "../views/Auth/EnterOTP/EnterOTP";
import ResetPassword from "../views/Auth/ResetPassword/ResetPassword";
import RequestCode from "../views/Auth/RequestCode/RequestCode";

// Scroll to top on route change
const ScrollToTopOnMount = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Router configuration
const routerConfig = [
  // Protected Routes (Dashboard)
  {
    path: "/",
    element: (
      <AuthRoutes.ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </AuthRoutes.ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
  },

  // Auth Routes (Public Only)
  {
    path: "/login",
    element: (
      <AuthRoutes.PublicOnlyRoute>
        <Login />
      </AuthRoutes.PublicOnlyRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthRoutes.PublicOnlyRoute>
        <ForgetPassword />
      </AuthRoutes.PublicOnlyRoute>
    ),
  },
  {
    path: "/enter-otp",
    element: (
      <AuthRoutes.PublicOnlyRoute>
        <EnterOTP />
      </AuthRoutes.PublicOnlyRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <AuthRoutes.PublicOnlyRoute>
        <ResetPassword />
      </AuthRoutes.PublicOnlyRoute>
    ),
  },
  {
    path: "/request-code",
    element: (
      <AuthRoutes.PublicOnlyRoute>
        <RequestCode />
      </AuthRoutes.PublicOnlyRoute>
    ),
  },

  // 404 Page
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

// Wrap all routes with ScrollToTop
const wrappedRoutes = routerConfig.map((route) => ({
  ...route,
  element: (
    <>
      <ScrollToTopOnMount />
      {route.element}
    </>
  ),
}));

const router = createBrowserRouter(wrappedRoutes);

export default router;
