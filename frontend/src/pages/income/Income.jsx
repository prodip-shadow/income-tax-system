import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Wallet,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";

import IncomeService from "@/services/incomeService";

const incomeTypes = [
  "Employment",
  "Rent",
  "Agriculture",
  "Business",
  "Capital Gains",
  "Financial Assets",
  "Other Sources",
];

const initialFormData = {
  income_type: "",
  source_name: "",
  amount: "",
  income_date: "",
  description: "",
};

const Income = () => {
  const [incomes, setIncomes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deletingIncomeId, setDeletingIncomeId] =
    useState(null);

  const [editingIncomeId, setEditingIncomeId] =
    useState(null);

  const [formData, setFormData] =
    useState(initialFormData);

  // ----------------------------- fetch income

  const fetchIncome = async () => {
    try {
      const response =
        await IncomeService.getMyIncome();

      setIncomes(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Get Income Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch income"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIncome();
  }, []);

  // ----------------------------- form change

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ----------------------------- edit income

  const handleEditIncome = (income) => {
    setEditingIncomeId(income.id);

    setFormData({
      income_type: income.income_type || "",
      source_name: income.source_name || "",
      amount: income.amount || "",
      income_date: income.income_date
        ? String(income.income_date).slice(0, 10)
        : "",
      description: income.description || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ----------------------------- close form

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIncomeId(null);
    setFormData(initialFormData);
  };

  // ----------------------------- submit income

  const handleSubmitIncome = async (event) => {
    event.preventDefault();

    if (
      !formData.income_type ||
      !formData.source_name ||
      !formData.amount ||
      !formData.income_date
    ) {
      toast.error(
        "Please fill in all required fields"
      );

      return;
    }

    if (Number(formData.amount) <= 0) {
      toast.error(
        "Amount must be greater than 0"
      );

      return;
    }

    try {
      setSubmitting(true);

      if (editingIncomeId) {
        await IncomeService.updateIncome(
          editingIncomeId,
          formData
        );

        toast.success(
          "Income updated successfully"
        );
      } else {
        await IncomeService.createIncome(
          formData
        );

        toast.success(
          "Income added successfully"
        );
      }

      setFormData(initialFormData);
      setEditingIncomeId(null);
      setShowForm(false);

      await fetchIncome();
    } catch (error) {
      console.error(
        "Income Submit Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save income"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------- delete income

  const handleDeleteIncome = (incomeId) => {
    toast(
      (t) => (
        <div className="w-[320px]">
          <p className="text-sm font-medium text-slate-900">
            Delete income?
          </p>

          <p className="mt-1 text-sm text-slate-500">
            This income record will be permanently
            deleted.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);

                try {
                  setDeletingIncomeId(incomeId);

                  await IncomeService.deleteIncome(
                    incomeId
                  );

                  toast.success(
                    "Income deleted successfully"
                  );

                  await fetchIncome();
                } catch (error) {
                  console.error(
                    "Delete Income Error:",
                    error
                  );

                  toast.error(
                    error.response?.data
                      ?.message ||
                      "Failed to delete income"
                  );
                } finally {
                  setDeletingIncomeId(null);
                }
              }}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      }
    );
  };

  // ----------------------------- helpers

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-BD"
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-BD",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ----------------------------- loading

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading income records...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        

           <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Income
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Add and manage your income records.
          </p>
        </div>

        <button
          type="button"
          onClick={
            showForm
              ? handleCloseForm
              : () => setShowForm(true)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          {showForm ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}

          {showForm ? "Close" : "Add Income"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-900">
              {editingIncomeId
                ? "Edit Income"
                : "Add Income"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter the income details below.
            </p>
          </div>

          <form
            onSubmit={handleSubmitIncome}
            className="space-y-5"
          >
            {/* Income Type + Source */}
            <div className="grid gap-5 md:grid-cols-2">

              {/* Income Type */}
              <div>
                <label
                  htmlFor="income_type"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Income Type
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="income_type"
                  name="income_type"
                  value={formData.income_type}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">
                    Select income type
                  </option>

                  {incomeTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Name */}
              <div>
                <label
                  htmlFor="source_name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Source Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="source_name"
                  name="source_name"
                  type="text"
                  value={formData.source_name}
                  onChange={handleChange}
                  placeholder="e.g. ABC Company"
                  required
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* Amount + Date */}
            <div className="grid gap-5 md:grid-cols-2">

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Amount
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    BDT
                  </span>

                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="60000"
                    required
                    className="h-11 w-full rounded-lg border border-slate-200 pl-12 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="income_date"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Income Date
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="income_date"
                    name="income_date"
                    type="date"
                    value={formData.income_date}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add an optional description"
                rows="3"
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={submitting}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingIncomeId
                    ? "Update Income"
                    : "Save Income"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income Records */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Table Header */}
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <Wallet className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <h3 className="text-base font-medium text-slate-900">
                Income Records
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {incomes.length}{" "}
                {incomes.length === 1
                  ? "record"
                  : "records"}
              </p>
            </div>
          </div>
        </div>

        {incomes.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <Wallet className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-3 text-sm text-slate-600">
              No income records found.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Add your first income record to get
              started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    SL
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Source
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-medium text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {incomes.map((income, index) => (
                  <tr
                    key={income.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-900">
                        {income.income_type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-900">
                          {income.source_name}
                        </p>

                        {income.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {income.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-900">
                        BDT{" "}
                        {formatAmount(
                          income.amount
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 text-slate-400" />

                        {formatDate(
                          income.income_date
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEditIncome(
                              income
                            )
                          }
                          disabled={
                            deletingIncomeId !==
                            null
                          }
                          title="Edit income"
                          aria-label="Edit income"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteIncome(
                              income.id
                            )
                          }
                          disabled={
                            deletingIncomeId ===
                            income.id
                          }
                          title="Delete income"
                          aria-label="Delete income"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Income;