import { createBrowserRouter } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/dashboard/Dashboard";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import Income from "@/pages/income/Income";
import Expense from "@/pages/expense/Expense";
import Profile from "@/pages/profile/Profile";
import TaxCalculation from "@/pages/tax/TaxCalculation";
import TaxDeductions from "@/pages/tax/TaxDeductions";
import TaxCalculationHistory from "@/pages/tax/TaxCalculationHistory";
import TaxCalculationDetails from "@/pages/tax/TaxCalculationDetails";
import AdminRoute from "./AdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminTaxRules from "@/pages/admin/AdminTaxRules";
import AdminTaxDeductionRules from "@/pages/admin/AdminTaxDeductionRules";
import AdminMinimumTaxRules from "@/pages/admin/AdminMinimumTaxRules";
import AdminTaxThresholds from "@/pages/admin/AdminTaxThresholds";
import AdminTaxRebateRules from "@/pages/admin/AdminTaxRebateRules";
import AdminSurchargeRules from "@/pages/admin/AdminSurchargeRules";
import AdminSalaryExemptionRules from "@/pages/admin/AdminSalaryExemptionRules";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },

  {
  path: "/admin",
  element: (
    <AdminRoute>
      <DashboardLayout />
    </AdminRoute>
  ),
  children: [
    {
      index: true,
      element: <AdminDashboard />,
    },
     {
        path: "users",
        element: <AdminUsers />,
      },
       {
      path: "tax-rules",
      element: <AdminTaxRules />,
    },
    {
      path: "tax-deduction-rules",
      element: <AdminTaxDeductionRules />,
    },
    {
      path: "minimum-tax-rules",
      element: <AdminMinimumTaxRules />,
    },
    {
      path: "tax-thresholds",
      element: <AdminTaxThresholds />,
    },
    {
      path: "tax-rebate-rules",
      element: <AdminTaxRebateRules />,
    },
    {
      path: "surcharge-rules",
      element: <AdminSurchargeRules />,
    },
    {
      path: "salary-exemption-rules",
      element: <AdminSalaryExemptionRules />,
    },
  ],
},

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "income",
        element: <Income />,
      },
      {
        path: "expense",
        element: <Expense />,
      },
      {
        path: "tax-deductions",
        element: <TaxDeductions />,
      },
      {
        path: "tax-calculation",
        element: <TaxCalculation />,
      },
      {
        path: "tax-calculation-history",
        element: <TaxCalculationHistory />,
      },
     
      {
        path: "tax-calculation-history/:id",
        element: <TaxCalculationDetails />,
      },
    ],
  },
]);

export default router;
