import { NavLink, useNavigate } from "react-router";

import {
  LayoutDashboard,
  User,
  Wallet,
  Receipt,
  Calculator,
  TrendingUp,
  FileText,
  LogOut,
  X,
  House,
  ShieldCheck,
  Users,
  ListChecks,
  MapPin,
  Sliders,
  Percent,
  Coins,
  PiggyBank,
} from "lucide-react";

import useAuth from "@/hooks/useAuth";

const menus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    path: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Income",
    path: "/dashboard/income",
    icon: Wallet,
  },
  {
    name: "Expense",
    path: "/dashboard/expense",
    icon: Receipt,
  },
  {
    name: "Investment & Rebate",
    path: "/dashboard/tax-deductions",
    icon: TrendingUp,
  },
  {
    name: "Tax Calculation",
    path: "/dashboard/tax-calculation",
    icon: Calculator,
  },
  {
    name: "Calculation History",
    path: "/dashboard/tax-calculation-history",
    icon: FileText,
  },
];

const adminMenus = [
  {
    name: "Admin Dashboard",
    path: "/admin",
    icon: ShieldCheck,
  },
  {
    name: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "Tax Slabs",
    path: "/admin/tax-rules",
    icon: Calculator,
  },
  {
    name: "Deduction Rules",
    path: "/admin/tax-deduction-rules",
    icon: ListChecks,
  },
  {
    name: "Minimum Tax Rules",
    path: "/admin/minimum-tax-rules",
    icon: MapPin,
  },
  {
    name: "Tax Thresholds",
    path: "/admin/tax-thresholds",
    icon: Sliders,
  },
  {
    name: "Tax Rebate Rules",
    path: "/admin/tax-rebate-rules",
    icon: Percent,
  },
  {
    name: "Surcharge Rules",
    path: "/admin/surcharge-rules",
    icon: Coins,
  },
  {
    name: "Salary Exemption Rules",
    path: "/admin/salary-exemption-rules",
    icon: PiggyBank,
  },
];

const DashboardSidebar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();

    setSidebarOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  const handleGoHome = () => {
    setSidebarOpen(false);

    navigate("/");
  };

  const renderMenu = (menu) => {
    const Icon = menu.icon;

    return (
      <NavLink
        key={menu.path}
        to={menu.path}
        end={
          menu.path === "/dashboard" ||
          menu.path === "/admin"
        }
        onClick={() => setSidebarOpen(false)}
        className={({ isActive }) =>
          `
          flex items-center gap-3 rounded-lg
          px-3 py-2.5 text-sm font-medium
          transition-colors
          ${
            isActive
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
          `
        }
      >
        <Icon className="h-4.5 w-4.5 shrink-0" />

        <span>{menu.name}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          border-r
          border-slate-200
          bg-white
          transition-transform
          duration-200
          ease-out

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:sticky
          md:top-0
          md:translate-x-0
        `}
      >
        {/* Sidebar Header */}

        <div className="shrink-0 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                IncomeTax
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Filing System
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close dashboard menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Information */}

          {user && (
            <div className="mt-5 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                {user.full_name
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {user.full_name}
                </h3>

                <p className="mt-0.5 truncate text-xs capitalize text-slate-500">
                  {user.role || "User"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}

        <nav className="min-h-0 flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          <div className="space-y-1">
            {/* Admin Menu */}

            {isAdmin && (
              <>
                {adminMenus.map(renderMenu)}

                <div className="my-4 border-t border-slate-200" />

                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  User Area
                </p>
              </>
            )}

            {/* Normal/User Menu */}

            {menus.map(renderMenu)}
          </div>
        </nav>

        {/* Sidebar Footer */}

        <div className="shrink-0 space-y-1 border-t border-slate-200 p-4">
          {/* Home */}

          <button
            type="button"
            onClick={handleGoHome}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <House className="h-4.5 w-4.5 shrink-0" />

            <span>Home</span>
          </button>

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;