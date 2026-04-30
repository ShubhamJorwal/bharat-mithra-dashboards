import { lazy, Suspense, useEffect } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter, useLocation } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import AuthRoutes from "./AuthRoutes";

// DashboardLayout is on the critical path, so import it eagerly. Dashboard
// is the index route — also eager.
import DashboardLayout from "@/components/Layout/DashboardLayout/DashboardLayout";
import Dashboard from "@/views/Dashboard/Dashboard";

// ─── Auth pages ─────────────────────────────────────────────────────────────
const Login = lazy(() => import("@/views/Auth/Login/Login"));
const ForgetPassword = lazy(() => import("@/views/Auth/ForgetPassword/ForgetPassword"));
const EnterOTP = lazy(() => import("@/views/Auth/EnterOTP/EnterOTP"));
const ResetPassword = lazy(() => import("@/views/Auth/ResetPassword/ResetPassword"));
const RequestCode = lazy(() => import("@/views/Auth/RequestCode/RequestCode"));

// ─── Users (citizens) ───────────────────────────────────────────────────────
const UserList = lazy(() => import("@/views/Users/UserList/UserList"));
const UserDetails = lazy(() => import("@/views/Users/UserDetails/UserDetails"));
const UserCreate = lazy(() => import("@/views/Users/UserCreate/UserCreate"));
const UserEdit = lazy(() => import("@/views/Users/UserEdit/UserEdit"));

// ─── Staff (BharatMithra employees) ────────────────────────────────────────
const StaffList = lazy(() => import("@/views/Staff/StaffList/StaffList"));
const StaffCreate = lazy(() => import("@/views/Staff/StaffCreate/StaffCreate"));
const StaffDetails = lazy(() => import("@/views/Staff/StaffDetails/StaffDetails"));
const StaffEdit = lazy(() => import("@/views/Staff/StaffEdit/StaffEdit"));

// ─── Services (rebuilt 2026-04-30) ──────────────────────────────────────────
const ServiceList = lazy(() => import("@/views/Services/ServiceList/ServiceList"));
const ServiceDetails = lazy(() => import("@/views/Services/ServiceDetails/ServiceDetails"));
const ServiceCreate = lazy(() => import("@/views/Services/ServiceCreate/ServiceCreate"));
const ServiceEdit = lazy(() => import("@/views/Services/ServiceEdit/ServiceEdit"));
const CategoryManager = lazy(() => import("@/views/Services/CategoryManager/CategoryManager"));

// ─── Geography ──────────────────────────────────────────────────────────────
const NationalDashboard = lazy(() => import("@/views/Geography/National/NationalDashboard"));
const StateList = lazy(() => import("@/views/Geography/States/StateList"));
const StateForm = lazy(() => import("@/views/Geography/States/StateForm"));
const StateDetails = lazy(() => import("@/views/Geography/States/StateDetails"));
const DistrictList = lazy(() => import("@/views/Geography/Districts/DistrictList"));
const DistrictForm = lazy(() => import("@/views/Geography/Districts/DistrictForm"));
const DistrictDetails = lazy(() => import("@/views/Geography/Districts/DistrictDetails"));
const TalukList = lazy(() => import("@/views/Geography/Taluks/TalukList"));
const TalukForm = lazy(() => import("@/views/Geography/Taluks/TalukForm"));
const TalukDetails = lazy(() => import("@/views/Geography/Taluks/TalukDetails"));
const GramPanchayatList = lazy(() => import("@/views/Geography/GramPanchayats/GramPanchayatList"));
const GramPanchayatForm = lazy(() => import("@/views/Geography/GramPanchayats/GramPanchayatForm"));
const GramPanchayatDetails = lazy(() => import("@/views/Geography/GramPanchayats/GramPanchayatDetails"));
const VillageList = lazy(() => import("@/views/Geography/Villages/VillageList"));
const VillageForm = lazy(() => import("@/views/Geography/Villages/VillageForm"));
const VillageDetails = lazy(() => import("@/views/Geography/Villages/VillageDetails"));

// ─── Other top-level pages ──────────────────────────────────────────────────
const Reports = lazy(() => import("@/views/Reports/Reports"));
const Calendar = lazy(() => import("@/views/Calendar/Calendar"));
const WalletStatements = lazy(() => import("@/views/Statements/Wallet/WalletStatements"));
const PaymentGateways = lazy(() => import("@/views/PaymentGateways/PaymentGateways"));
const Finance = lazy(() => import("@/views/Finance/Finance"));
const Documents = lazy(() => import("@/views/Documents/Documents"));
const Shortcuts = lazy(() => import("@/views/Shortcuts/Shortcuts"));
const Settings = lazy(() => import("@/views/Settings/Settings"));
const Telecaller = lazy(() => import("@/views/Telecaller/Telecaller"));
const SupportDashboard = lazy(() => import("@/views/SupportDashboard/SupportDashboard"));
const TestPlan = lazy(() => import("@/views/TestPlan/TestPlan"));

// Minimal fallback shown briefly while a route chunk downloads.
const RouteFallback = () => <div style={{ minHeight: "60vh" }} />;

const lazyRoute = (element: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

// Scroll to top on route change
const ScrollToTopOnMount = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const routerConfig = [
  {
    path: "/",
    element: (
      <AuthRoutes.ProtectedRoute>
        <DashboardLayout />
      </AuthRoutes.ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Dashboard /> },

      // Users
      { path: "users", element: lazyRoute(<UserList />) },
      { path: "users/new", element: lazyRoute(<UserCreate />) },
      { path: "users/:id", element: lazyRoute(<UserDetails />) },
      { path: "users/:id/edit", element: lazyRoute(<UserEdit />) },

      // Staff
      { path: "staff", element: lazyRoute(<StaffList />) },
      { path: "staff/new", element: lazyRoute(<StaffCreate />) },
      { path: "staff/:id", element: lazyRoute(<StaffDetails />) },
      { path: "staff/:id/edit", element: lazyRoute(<StaffEdit />) },

      // Services (rebuilt)
      { path: "services", element: lazyRoute(<ServiceList />) },
      { path: "services/new", element: lazyRoute(<ServiceCreate />) },
      { path: "services/categories", element: lazyRoute(<CategoryManager />) },
      { path: "services/:id", element: lazyRoute(<ServiceDetails />) },
      { path: "services/:id/edit", element: lazyRoute(<ServiceEdit />) },

      // Geography
      { path: "geography", element: lazyRoute(<NationalDashboard />) },
      { path: "geography/states", element: lazyRoute(<StateList />) },
      { path: "geography/states/new", element: lazyRoute(<StateForm />) },
      { path: "geography/states/:id", element: lazyRoute(<StateDetails />) },
      { path: "geography/states/:id/edit", element: lazyRoute(<StateForm />) },
      { path: "geography/districts", element: lazyRoute(<DistrictList />) },
      { path: "geography/districts/new", element: lazyRoute(<DistrictForm />) },
      { path: "geography/districts/:id", element: lazyRoute(<DistrictDetails />) },
      { path: "geography/districts/:id/edit", element: lazyRoute(<DistrictForm />) },
      { path: "geography/taluks", element: lazyRoute(<TalukList />) },
      { path: "geography/taluks/new", element: lazyRoute(<TalukForm />) },
      { path: "geography/taluks/:id", element: lazyRoute(<TalukDetails />) },
      { path: "geography/taluks/:id/edit", element: lazyRoute(<TalukForm />) },
      { path: "geography/gram-panchayats", element: lazyRoute(<GramPanchayatList />) },
      { path: "geography/gram-panchayats/new", element: lazyRoute(<GramPanchayatForm />) },
      { path: "geography/gram-panchayats/:id", element: lazyRoute(<GramPanchayatDetails />) },
      { path: "geography/gram-panchayats/:id/edit", element: lazyRoute(<GramPanchayatForm />) },
      { path: "geography/villages", element: lazyRoute(<VillageList />) },
      { path: "geography/villages/new", element: lazyRoute(<VillageForm />) },
      { path: "geography/villages/:id", element: lazyRoute(<VillageDetails />) },
      { path: "geography/villages/:id/edit", element: lazyRoute(<VillageForm />) },

      // Statements / Finance / Payments
      { path: "statements/wallet", element: lazyRoute(<WalletStatements />) },
      { path: "payment-gateways", element: lazyRoute(<PaymentGateways />) },
      { path: "finance", element: lazyRoute(<Finance />) },

      // Documents / Calendar / Reports
      { path: "documents", element: lazyRoute(<Documents />) },
      { path: "calendar", element: lazyRoute(<Calendar />) },
      { path: "reports", element: lazyRoute(<Reports />) },

      // Telecaller / Support / misc
      { path: "telecaller", element: lazyRoute(<Telecaller />) },
      { path: "support", element: lazyRoute(<SupportDashboard />) },
      { path: "shortcuts", element: lazyRoute(<Shortcuts />) },
      { path: "settings", element: lazyRoute(<Settings />) },

      // Test Plan — Full Blueprint
      { path: "test", element: lazyRoute(<TestPlan />) },
    ],
  },

  // Auth
  { path: "/login",          element: <AuthRoutes.PublicOnlyRoute>{lazyRoute(<Login />)}</AuthRoutes.PublicOnlyRoute> },
  { path: "/forgot-password", element: <AuthRoutes.PublicOnlyRoute>{lazyRoute(<ForgetPassword />)}</AuthRoutes.PublicOnlyRoute> },
  { path: "/enter-otp",       element: <AuthRoutes.PublicOnlyRoute>{lazyRoute(<EnterOTP />)}</AuthRoutes.PublicOnlyRoute> },
  { path: "/reset-password",  element: <AuthRoutes.PublicOnlyRoute>{lazyRoute(<ResetPassword />)}</AuthRoutes.PublicOnlyRoute> },
  { path: "/request-code",    element: <AuthRoutes.PublicOnlyRoute>{lazyRoute(<RequestCode />)}</AuthRoutes.PublicOnlyRoute> },

  { path: "*", element: <NotFoundPage /> },
];

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
