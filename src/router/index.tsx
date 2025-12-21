import { useEffect } from "react";
import { createBrowserRouter, useLocation } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import AuthRoutes from "./AuthRoutes";
import Layout from "../components/Layout/Layout";
import Dashboard from "../views/Dashboard/Dashboard";

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
  {
    path: "/login",
    element: (
      <AuthRoutes.PublicOnlyRoute>
        <div>Login Page</div>
      </AuthRoutes.PublicOnlyRoute>
    ),
  },
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
