import { useEffect } from "react";
import { createBrowserRouter, useLocation } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import AuthRoutes from "./AuthRoutes";
import DashboardLayout from "../components/Layout/DashboardLayout/DashboardLayout";
import Dashboard from "../views/Dashboard/Dashboard";

// Auth Pages
import Login from "../views/Auth/Login/Login";
import ForgetPassword from "../views/Auth/ForgetPassword/ForgetPassword";
import EnterOTP from "../views/Auth/EnterOTP/EnterOTP";
import ResetPassword from "../views/Auth/ResetPassword/ResetPassword";
import RequestCode from "../views/Auth/RequestCode/RequestCode";

// Users Pages
import { UserList, UserDetails, UserCreate, UserEdit } from "../views/Users";

// Services Pages
import { ServiceList, ServiceDetails, ServiceCreate, ServiceEdit, ServicePortal, ServiceCategoryView } from "../views/Services";
import { CategoryList, CategoryCreate, CategoryEdit } from "../views/Services/Categories";

// Applications Pages
import { ApplicationList, ApplicationDetails, ApplicationCreate } from "../views/Applications";

// Reports Page
import { Reports } from "../views/Reports";

// Calendar Page
import { Calendar } from "../views/Calendar";

// Statements Pages
import { WalletStatements } from "../views/Statements";

// Payment Gateways Pages
import { PaymentGateways } from "../views/PaymentGateways";

// Staff Pages
import { StaffList } from "../views/Staff";

// Geography Pages
import NationalDashboard from "../views/Geography/National/NationalDashboard";
import StateList from "../views/Geography/States/StateList";
import StateForm from "../views/Geography/States/StateForm";
import StateDetails from "../views/Geography/States/StateDetails";
import DistrictList from "../views/Geography/Districts/DistrictList";
import DistrictForm from "../views/Geography/Districts/DistrictForm";
import DistrictDetails from "../views/Geography/Districts/DistrictDetails";
import TalukList from "../views/Geography/Taluks/TalukList";
import TalukForm from "../views/Geography/Taluks/TalukForm";
import TalukDetails from "../views/Geography/Taluks/TalukDetails";
import GramPanchayatList from "../views/Geography/GramPanchayats/GramPanchayatList";
import GramPanchayatForm from "../views/Geography/GramPanchayats/GramPanchayatForm";
import GramPanchayatDetails from "../views/Geography/GramPanchayats/GramPanchayatDetails";
import VillageList from "../views/Geography/Villages/VillageList";
import VillageForm from "../views/Geography/Villages/VillageForm";
import VillageDetails from "../views/Geography/Villages/VillageDetails";

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
        <DashboardLayout />
      </AuthRoutes.ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Users Routes
      {
        path: "users",
        element: <UserList />,
      },
      {
        path: "users/new",
        element: <UserCreate />,
      },
      {
        path: "users/:id",
        element: <UserDetails />,
      },
      {
        path: "users/:id/edit",
        element: <UserEdit />,
      },
      // Services Portal Routes
      {
        path: "services/portal",
        element: <ServicePortal />,
      },
      {
        path: "services/portal/:slug",
        element: <ServiceCategoryView />,
      },
      // Services Routes
      {
        path: "services",
        element: <ServiceList />,
      },
      {
        path: "services/new",
        element: <ServiceCreate />,
      },
      {
        path: "services/:id",
        element: <ServiceDetails />,
      },
      {
        path: "services/:id/edit",
        element: <ServiceEdit />,
      },
      // Categories Routes (under Services)
      {
        path: "services/categories",
        element: <CategoryList />,
      },
      {
        path: "services/categories/new",
        element: <CategoryCreate />,
      },
      {
        path: "services/categories/:id/edit",
        element: <CategoryEdit />,
      },
      // Geography Routes
      {
        path: "geography",
        element: <NationalDashboard />,
      },
      // States
      {
        path: "geography/states",
        element: <StateList />,
      },
      {
        path: "geography/states/new",
        element: <StateForm />,
      },
      {
        path: "geography/states/:id",
        element: <StateDetails />,
      },
      {
        path: "geography/states/:id/edit",
        element: <StateForm />,
      },
      // Districts
      {
        path: "geography/districts",
        element: <DistrictList />,
      },
      {
        path: "geography/districts/new",
        element: <DistrictForm />,
      },
      {
        path: "geography/districts/:id",
        element: <DistrictDetails />,
      },
      {
        path: "geography/districts/:id/edit",
        element: <DistrictForm />,
      },
      // Taluks
      {
        path: "geography/taluks",
        element: <TalukList />,
      },
      {
        path: "geography/taluks/new",
        element: <TalukForm />,
      },
      {
        path: "geography/taluks/:id",
        element: <TalukDetails />,
      },
      {
        path: "geography/taluks/:id/edit",
        element: <TalukForm />,
      },
      // Gram Panchayats
      {
        path: "geography/gram-panchayats",
        element: <GramPanchayatList />,
      },
      {
        path: "geography/gram-panchayats/new",
        element: <GramPanchayatForm />,
      },
      {
        path: "geography/gram-panchayats/:id",
        element: <GramPanchayatDetails />,
      },
      {
        path: "geography/gram-panchayats/:id/edit",
        element: <GramPanchayatForm />,
      },
      // Villages
      {
        path: "geography/villages",
        element: <VillageList />,
      },
      {
        path: "geography/villages/new",
        element: <VillageForm />,
      },
      {
        path: "geography/villages/:id",
        element: <VillageDetails />,
      },
      {
        path: "geography/villages/:id/edit",
        element: <VillageForm />,
      },
      // Applications Routes
      {
        path: "applications",
        element: <ApplicationList />,
      },
      {
        path: "applications/new",
        element: <ApplicationCreate />,
      },
      {
        path: "applications/:id",
        element: <ApplicationDetails />,
      },
      // Statements Routes
      {
        path: "statements/wallet",
        element: <WalletStatements />,
      },
      // Payment Gateways
      {
        path: "payment-gateways",
        element: <PaymentGateways />,
      },
      // Other Routes (Placeholders)
      {
        path: "documents",
        element: <Dashboard />, // Placeholder
      },
      {
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      // Staff Routes
      {
        path: "staff",
        element: <StaffList />,
      },
      {
        path: "notifications",
        element: <Dashboard />, // Placeholder
      },
      {
        path: "files",
        element: <Dashboard />, // Placeholder
      },
      {
        path: "shortcuts",
        element: <Dashboard />, // Placeholder
      },
      {
        path: "help",
        element: <Dashboard />, // Placeholder
      },
      {
        path: "settings",
        element: <Dashboard />, // Placeholder
      },
    ],
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
