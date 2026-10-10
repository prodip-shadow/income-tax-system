import { useEffect, useState } from "react";
import {
  Users,
  WalletCards,
  Receipt,
  Calculator,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import AdminService from "@/services/adminService";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            {value}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Icon className="h-6 w-6 text-slate-700" />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // initial dashboard data load
  useEffect(() => {
    let cancelled = false;

    AdminService.getDashboardStats()
      .then((response) => {
        if (cancelled) {
          return;
        }

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load admin dashboard statistics.",
          );
        }

        setStats(response.data);
        setError("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("Admin dashboard error:", error);

        setStats(null);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load admin dashboard statistics.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // retry / refresh dashboard data
  const handleRefresh = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await AdminService.getDashboardStats();

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to load admin dashboard statistics.",
        );
      }

      setStats(response.data);
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setStats(null);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load admin dashboard statistics.",
      );
    } finally {
      setLoading(false);
    }
  };

  // loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-slate-500" />

          <p className="mt-3 text-sm text-slate-500">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />

          <h2 className="mt-3 text-lg font-semibold text-red-800">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // dashboard overview
  return (
    <div className="space-y-6">
      {/* =========================
          Header
      ========================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            <span>Administration</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of the income tax filing system.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* =========================
          Overview Statistics
      ========================== */}
      <section>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {/* Total Users */}
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            description="Registered users"
            icon={Users}
          />

          {/* Income Records */}
          <StatCard
            title="Income Records"
            value={stats?.totalIncomeRecords ?? 0}
            description="Total income entries"
            icon={WalletCards}
          />

          {/* Expense Records */}
          <StatCard
            title="Expense Records"
            value={stats?.totalExpenseRecords ?? 0}
            description="Total expense entries"
            icon={Receipt}
          />

          {/* Tax Calculations */}
          <StatCard
            title="Tax Calculations"
            value={stats?.totalTaxCalculations ?? 0}
            description="Generated calculations"
            icon={Calculator}
          />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
