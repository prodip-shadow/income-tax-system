import { useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Calculator,
  FileText,
  Receipt,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FinancialService from "@/services/financialService";
import TaxCalculationService from "@/services/taxCalculationService";

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [taxCalculations, setTaxCalculations] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        summaryResponse,
        incomeResponse,
        expenseResponse,
        taxResponse,
      ] = await Promise.all([
        FinancialService.getFinancialSummary(),
        FinancialService.getIncome(),
        FinancialService.getExpense(),
        TaxCalculationService.getCalculations(),
      ]);

      setSummary(
        summaryResponse?.data || {
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
        }
      );

      setIncomes(
        Array.isArray(incomeResponse?.data)
          ? incomeResponse.data
          : []
      );

      setExpenses(
        Array.isArray(expenseResponse?.data)
          ? expenseResponse.data
          : []
      );

      setTaxCalculations(
        Array.isArray(taxResponse?.data)
          ? taxResponse.data
          : []
      );
    } catch (error) {
      console.error(
        "Dashboard Data Fetch Error:",
        error
      );

      setSummary({
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
      });

      setIncomes([]);
      setExpenses([]);
      setTaxCalculations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  // ----------------------------- helpers

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-BD"
    );
  };

  // ----------------------------- loading state

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">

      {/* =========================
          Header
      ========================== */}

      <div>
        <p className="text-sm text-slate-500">
          Overview
        </p>

        <h2 className="mt-1 text-2xl font-medium text-slate-900">
          Dashboard
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          A simple overview of your financial records.
        </p>
      </div>

      {/* =========================
          Financial Overview
      ========================== */}

      <section>
        <div className="mb-4">
          <h3 className="text-base font-medium text-slate-900">
            Financial Overview
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Your overall financial position.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">

          {/* Total Income */}

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-normal text-slate-600">
                  Total Income
                </CardTitle>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <ArrowUpCircle className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-medium text-slate-900">
                BDT {formatAmount(summary.totalIncome)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Total recorded income
              </p>
            </CardContent>
          </Card>

          {/* Total Expense */}

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-normal text-slate-600">
                  Total Expense
                </CardTitle>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <ArrowDownCircle className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-medium text-slate-900">
                BDT {formatAmount(summary.totalExpense)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Total recorded expenses
              </p>
            </CardContent>
          </Card>

          {/* Net Balance */}

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-normal text-slate-600">
                  Net Balance
                </CardTitle>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Wallet className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-medium text-slate-900">
                BDT {formatAmount(summary.netBalance)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Income minus expenses
              </p>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* =========================
          System Overview
      ========================== */}

      <section>
        <div className="mb-4">
          <h3 className="text-base font-medium text-slate-900">
            System Overview
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your records.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">

          {/* Income Records */}

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-normal text-slate-600">
                  Income Records
                </CardTitle>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-medium text-slate-900">
                {incomes.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Total income records
              </p>
            </CardContent>
          </Card>

          {/* Expense Records */}

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-normal text-slate-600">
                  Expense Records
                </CardTitle>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Receipt className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-medium text-slate-900">
                {expenses.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Total expense records
              </p>
            </CardContent>
          </Card>

          {/* Tax Calculations */}

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-normal text-slate-600">
                  Tax Calculations
                </CardTitle>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Calculator className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-medium text-slate-900">
                {taxCalculations.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Total tax calculations
              </p>
            </CardContent>
          </Card>

        </div>
      </section>

    </div>
  );
};

export default Dashboard;