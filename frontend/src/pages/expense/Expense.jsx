import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Receipt,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import ExpenseService from "@/services/expenseService";

const initialFormData = {
  expense_category: "",
  expense_type_id: "",
  description: "",
  amount: "",
  expense_date: "",
};

const Expense = () => {

  const [expenses, setExpenses] = useState([]);

  const [expenseTypes, setExpenseTypes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [expenseTypesLoading, setExpenseTypesLoading] =
    useState(false);

  const [showForm, setShowForm] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [editingExpenseId, setEditingExpenseId] =
    useState(null);

  const [deletingExpenseId, setDeletingExpenseId] =
    useState(null);

  const [formData, setFormData] =
    useState(initialFormData);

  // fetch expenses

  const fetchExpense = async () => {
    try {
      const response =
        await ExpenseService.getMyExpense();

      setExpenses(
        Array.isArray(response?.data)
          ? response.data
          : [],
      );
    } catch (error) {
      console.error(
        "Get Expense Error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch expenses",
      );
    } finally {
      setLoading(false);
    }
  };

  // fetch expense types

  const fetchExpenseTypes = async (category = "") => {
    try {
      setExpenseTypesLoading(true);

      const response =
        await ExpenseService.getExpenseTypes(category);

      setExpenseTypes(
        Array.isArray(response?.data)
          ? response.data
          : [],
      );
    } catch (error) {
      console.error(
        "Get Expense Types Error:",
        error,
      );

      setExpenseTypes([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch expense types",
      );
    } finally {
      setExpenseTypesLoading(false);
    }
  };


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExpense();
  }, []);

  // form change

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // category change

  const handleCategoryChange = async (event) => {
    const category = event.target.value;

    setFormData((previousData) => ({
      ...previousData,
      expense_category: category,
      expense_type_id: "",
    }));

    if (!category) {
      setExpenseTypes([]);
      return;
    }

    await fetchExpenseTypes(category);
  };

  // edit expense

  const handleEditExpense = async (expense) => {
    const category =
      expense.expense_category || "";

    setEditingExpenseId(expense.id);

    setFormData({
      expense_category: category,

      expense_type_id:
        expense.expense_type_id
          ? String(expense.expense_type_id)
          : "",

      description:
        expense.description || "",

      amount:
        expense.amount ?? "",

      expense_date:
        expense.expense_date
          ? String(
              expense.expense_date,
            ).slice(0, 10)
          : "",
    });

    setShowForm(true);

    if (category) {
      await fetchExpenseTypes(category);
    } else {
      setExpenseTypes([]);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // close form

  const handleCloseForm = () => {
    setShowForm(false);

    setEditingExpenseId(null);

    setFormData(initialFormData);

    setExpenseTypes([]);
  };

  // submit expense

  const handleSubmitExpense = async (
    event,
  ) => {
    event.preventDefault();

    // required field validation

    if (
      !formData.expense_category ||
      !formData.expense_type_id ||
      !formData.amount ||
      !formData.expense_date
    ) {
      toast.error(
        "Please fill in all required fields",
      );

      return;
    }

    // amount validation

    const amount = Number(
      formData.amount,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      toast.error(
        "Amount must be greater than 0",
      );

      return;
    }

    // check selected expense type

    const selectedExpenseType =
      expenseTypes.find(
        (type) =>
          String(type.id) ===
          String(
            formData.expense_type_id,
          ),
      );

    if (!selectedExpenseType) {
      toast.error(
        "Please select a valid expense type",
      );

      return;
    }

    // verify type belongs to category

    if (
      selectedExpenseType.expense_category !==
      formData.expense_category
    ) {
      toast.error(
        "Selected expense type does not belong to the selected category",
      );

      return;
    }

    // backend only needs expense_type_id.
    // do not send:
    // expense_category
    // expense_type
    // is_tax_deductible
    // backend derives category and tax deductibility
    // from the master expense_types table.

    const payload = {
      expense_type_id: Number(
        formData.expense_type_id,
      ),

      description:
        formData.description.trim() ||
        null,

      amount,

      expense_date:
        formData.expense_date,
    };

    try {
      setSubmitting(true);


      if (editingExpenseId) {
        await ExpenseService.updateExpense(
          editingExpenseId,
          payload,
        );

        toast.success(
          "Expense updated successfully",
        );
      }


      else {
        await ExpenseService.createExpense(
          payload,
        );

        toast.success(
          "Expense added successfully",
        );
      }

      // reset

      setFormData(initialFormData);

      setEditingExpenseId(null);

      setShowForm(false);

      setExpenseTypes([]);

      // refresh expenses

      await fetchExpense();
    } catch (error) {
      console.error(
        "Expense Submit Error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save expense",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // delete expense

  const handleDeleteExpense = (
    expenseId,
  ) => {
    toast(
      (t) => (
        <div className="w-[320px]">
          <p className="text-sm font-medium text-slate-900">
            Delete expense?
          </p>

          <p className="mt-1 text-sm text-slate-500">
            This expense record will be
            permanently deleted.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                toast.dismiss(t.id)
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);

                try {
                  setDeletingExpenseId(
                    expenseId,
                  );

                  await ExpenseService.deleteExpense(
                    expenseId,
                  );

                  toast.success(
                    "Expense deleted successfully",
                  );

                  await fetchExpense();
                } catch (error) {
                  console.error(
                    "Delete Expense Error:",
                    error,
                  );

                  toast.error(
                    error.response?.data
                      ?.message ||
                      "Failed to delete expense",
                  );
                } finally {
                  setDeletingExpenseId(
                    null,
                  );
                }
              }}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      },
    );
  };

  // format amount

  const formatAmount = (
    amount,
  ) => {
    return Number(
      amount || 0,
    ).toLocaleString("en-BD");
  };

  // format date

  const formatDate = (
    date,
  ) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-BD",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  // loading

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-5 w-5 animate-spin text-slate-400" />

          <p className="mt-3 text-sm text-slate-500">
            Loading expense records...
          </p>
        </div>
      </div>
    );
  }

  // ui

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Expense
          </h2>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Add and manage your expense
            records.
          </p>
        </div>

        <button
          type="button"
          onClick={
            showForm
              ? handleCloseForm
              : () =>
                  setShowForm(true)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          {showForm ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}

          {showForm
            ? "Close"
            : "Add Expense"}
        </button>
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingExpenseId
                ? "Edit Expense"
                : "Add Expense"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter the expense details
              below.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmitExpense
            }
            className="space-y-5"
          >
            {/* =================================================
                EXPENSE CATEGORY
            ================================================== */}

            <div>
              <label
                htmlFor="expense_category"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Expense Category

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="expense_category"
                name="expense_category"
                value={
                  formData.expense_category
                }
                onChange={
                  handleCategoryChange
                }
                required
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  Select expense category
                </option>

                <option value="BUSINESS">
                  Business
                </option>

                <option value="PERSONAL">
                  Personal
                </option>
              </select>
            </div>

            {/* =================================================
                EXPENSE TYPE
            ================================================== */}

            <div>
              <label
                htmlFor="expense_type_id"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Expense Type

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="expense_type_id"
                name="expense_type_id"
                value={
                  formData.expense_type_id
                }
                onChange={handleChange}
                required
                disabled={
                  !formData.expense_category ||
                  expenseTypesLoading ||
                  submitting
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {!formData.expense_category
                    ? "Select category first"
                    : expenseTypesLoading
                      ? "Loading expense types..."
                      : "Select expense type"}
                </option>

                {expenseTypes.map(
                  (type) => (
                    <option
                      key={type.id}
                      value={type.id}
                    >
                      {type.expense_name}
                    </option>
                  ),
                )}
              </select>

              {formData.expense_category &&
                !expenseTypesLoading &&
                expenseTypes.length ===
                  0 && (
                  <p className="mt-2 text-xs text-red-500">
                    No active expense
                    types are available
                    for this category.
                  </p>
                )}
            </div>

            {/* =================================================
                AMOUNT + DATE
            ================================================== */}

            <div className="grid gap-5 md:grid-cols-2">
              {/* AMOUNT */}

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
                    value={
                      formData.amount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="5000"
                    required
                    disabled={
                      submitting
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* DATE */}

              <div>
                <label
                  htmlFor="expense_date"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Expense Date

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="expense_date"
                    name="expense_date"
                    type="date"
                    value={
                      formData.expense_date
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      submitting
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

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
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                maxLength={255}
                rows={3}
                placeholder="Enter a short description..."
                disabled={submitting}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {
                  formData.description
                    .length
                }{" "}
                / 255
              </p>
            </div>

            {/* =================================================
                BUTTONS
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  handleCloseForm
                }
                disabled={submitting}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  expenseTypesLoading ||
                  !formData.expense_category ||
                  !formData.expense_type_id ||
                  expenseTypes.length ===
                    0
                }
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingExpenseId
                    ? "Update Expense"
                    : "Save Expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          EXPENSE RECORDS
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <Receipt className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Expense Records
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {expenses.length}{" "}
                {expenses.length === 1
                  ? "record"
                  : "records"}
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}

        {expenses.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <Receipt className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-3 text-sm text-slate-600">
              No expense records
              found.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Add your first expense
              record to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    SL
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Description
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
                {expenses.map(
                  (
                    expense,
                    index,
                  ) => (
                    <tr
                      key={
                        expense.id
                      }
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                    >
                      {/* SL */}

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      {/* TYPE */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-900">
                          {
                            expense.expense_name
                          }
                        </p>
                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {
                            expense.expense_category
                          }
                        </span>
                      </td>

                      {/* DESCRIPTION */}

                      <td className="px-5 py-4">
                        <p className="max-w-xs truncate text-sm text-slate-600">
                          {
                            expense.description ||
                            ""
                          }
                        </p>
                      </td>

                      {/* AMOUNT */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          BDT{" "}
                          {formatAmount(
                            expense.amount,
                          )}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          {formatDate(
                            expense.expense_date,
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEditExpense(
                                expense,
                              )
                            }
                            disabled={
                              deletingExpenseId !==
                              null
                            }
                            title="Edit expense"
                            aria-label="Edit expense"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteExpense(
                                expense.id,
                              )
                            }
                            disabled={
                              deletingExpenseId ===
                              expense.id
                            }
                            title="Delete expense"
                            aria-label="Delete expense"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingExpenseId ===
                            expense.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;