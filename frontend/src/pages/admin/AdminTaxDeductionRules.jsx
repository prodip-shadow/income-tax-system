import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Pencil,
  X,
  Power,
  Search,
  Eye,
  ChevronLeft,
} from "lucide-react";

import toast from "react-hot-toast";

import AdminDeductionRuleService from "@/services/adminDeductionRuleService";
import TaxRuleService from "@/services/taxRuleService";

const emptyForm = {
  tax_year: "",
  deduction_code: "",
  deduction_name: "",
  description: "",
  income_type: "",
  calculation_type: "ACTUAL",
  deduction_rate: "0",
  maximum_amount: "",
  effective_from: "",
  effective_to: "",
};

const CALCULATION_TYPES = ["FIXED", "PERCENTAGE", "LIMITED", "ACTUAL"];

const AdminTaxDeductionRules = () => {
  const [rules, setRules] = useState([]);
  const [taxYears, setTaxYears] = useState([]);

  const [selectedTaxYear, setSelectedTaxYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingYears, setLoadingYears] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [viewingRule, setViewingRule] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState(null);

  // load tax years

  useEffect(() => {
    let cancelled = false;

    TaxRuleService.getAvailableTaxYears()
      .then((response) => {
        if (cancelled) return;

        setTaxYears(response?.data || []);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error("Tax year loading error:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingYears(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // load rules

  const loadRules = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};

      if (selectedTaxYear) {
        filters.tax_year = selectedTaxYear;
      }

      if (selectedStatus) {
        filters.status = selectedStatus;
      }

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      const response =
        await AdminDeductionRuleService.getAllDeductionRules(filters);

      setRules(response?.data || []);
    } catch (err) {
      console.error("Deduction rules loading error:", err);

      setRules([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load deduction rules.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, [selectedTaxYear, selectedStatus]);

  // search handler

  const handleSearch = (event) => {
    event.preventDefault();
    loadRules();
  };

  // form handlers

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreate = () => {
    setEditingRule(null);

    setForm({
      ...emptyForm,
      tax_year: selectedTaxYear || (taxYears.length > 0 ? taxYears[0] : ""),
    });

    setShowForm(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);

    setForm({
      tax_year: rule.tax_year || "",
      deduction_code: rule.deduction_code || "",
      deduction_name: rule.deduction_name || "",
      description: rule.description || "",
      income_type: rule.income_type || "",
      calculation_type: rule.calculation_type || "ACTUAL",
      deduction_rate: rule.deduction_rate ?? "0",
      maximum_amount: rule.maximum_amount ?? "",
      effective_from: rule.effective_from
        ? String(rule.effective_from).slice(0, 10)
        : "",
      effective_to: rule.effective_to
        ? String(rule.effective_to).slice(0, 10)
        : "",
    });

    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingRule(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        tax_year: form.tax_year,
        deduction_code: form.deduction_code,
        deduction_name: form.deduction_name,
        description: form.description || null,
        income_type: form.income_type || null,
        calculation_type: form.calculation_type,
        deduction_rate: Number(form.deduction_rate) || 0,
        maximum_amount:
          form.maximum_amount === ""
            ? null
            : Number(form.maximum_amount),
        effective_from: form.effective_from,
        effective_to: form.effective_to || null,
      };

      if (editingRule) {
        await AdminDeductionRuleService.updateDeductionRule(
          editingRule.id,
          payload,
        );

        toast.success("Deduction rule updated successfully.");
      } else {
        await AdminDeductionRuleService.createDeductionRule(payload);

        toast.success("Deduction rule created successfully.");
      }

      setShowForm(false);
      setEditingRule(null);
      setForm(emptyForm);

      await loadRules();
    } catch (err) {
      console.error("Deduction rule save error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save deduction rule.",
      );
    } finally {
      setSaving(false);
    }
  };

  // status toggle

  const handleStatusToggle = (rule) => {
    const nextStatus =
      rule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const action =
      nextStatus === "ACTIVE" ? "activate" : "deactivate";

    setConfirmDialog({
      title: `${nextStatus === "ACTIVE" ? "Activate" : "Deactivate"} Deduction Rule`,
      message: `Are you sure you want to ${action} "${rule.deduction_name}"?`,
      onConfirm: async () => {
        try {
          await AdminDeductionRuleService.updateDeductionRuleStatus(
            rule.id,
            nextStatus,
          );

          toast.success(
            `Deduction rule ${action}d successfully.`,
          );

          await loadRules();
        } catch (err) {
          console.error("Status update error:", err);

          toast.error(
            err?.response?.data?.message ||
              err?.message ||
              `Failed to ${action} deduction rule.`,
          );
        }

        setConfirmDialog(null);
      },
    });
  };

  // view detail

  const handleViewDetail = async (rule) => {
    try {
      setLoadingDetail(true);

      const response =
        await AdminDeductionRuleService.getDeductionRuleById(rule.id);

      setViewingRule(response?.data || rule);
    } catch (err) {
      console.error("Deduction rule detail error:", err);

      toast.error("Failed to load deduction rule details.");

      setViewingRule(rule);
    } finally {
      setLoadingDetail(false);
    }
  };

  // format money

  const formatMoney = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    return Number(value).toLocaleString("en-BD", {
      maximumFractionDigits: 2,
    });
  };

  // format date

  const formatDate = (value) => {
    if (!value) return "—";

    return String(value).slice(0, 10);
  };

  // loading state

  if (loading && rules.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-slate-500" />

          <p className="mt-3 text-sm text-slate-500">
            Loading deduction rules...
          </p>
        </div>
      </div>
    );
  }

  // detail view

  if (viewingRule) {
    return (
      <div className="space-y-8">
        <div>
          <button
            type="button"
            onClick={() => setViewingRule(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />

            Back to Deduction Rules
          </button>

          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Deduction Rule Details
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loadingDetail ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <DetailItem label="ID" value={viewingRule.id} />

              <DetailItem label="Tax Year" value={viewingRule.tax_year} />

              <DetailItem
                label="Deduction Code"
                value={viewingRule.deduction_code}
              />

              <DetailItem
                label="Deduction Name"
                value={viewingRule.deduction_name}
              />

              <div className="md:col-span-2">
                <DetailItem
                  label="Description"
                  value={viewingRule.description || "—"}
                />
              </div>

              <DetailItem
                label="Income Type"
                value={viewingRule.income_type || "—"}
              />

              <DetailItem
                label="Calculation Type"
                value={viewingRule.calculation_type}
              />

              <DetailItem
                label="Deduction Rate"
                value={`${Number(viewingRule.deduction_rate || 0).toFixed(2)}%`}
              />

              <DetailItem
                label="Maximum Amount"
                value={
                  viewingRule.maximum_amount !== null
                    ? `BDT ${formatMoney(viewingRule.maximum_amount)}`
                    : "—"
                }
              />

              <DetailItem
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      viewingRule.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {viewingRule.status}
                  </span>
                }
              />

              <DetailItem
                label="Effective From"
                value={formatDate(viewingRule.effective_from)}
              />

              <DetailItem
                label="Effective To"
                value={formatDate(viewingRule.effective_to)}
              />

              <DetailItem
                label="Created At"
                value={viewingRule.created_at
                  ? new Date(viewingRule.created_at).toLocaleString()
                  : "—"}
              />

              <DetailItem
                label="Updated At"
                value={viewingRule.updated_at
                  ? new Date(viewingRule.updated_at).toLocaleString()
                  : "—"}
              />
            </div>
          )}

          <div className="mt-8 flex gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => {
                handleEdit(viewingRule);
                setViewingRule(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />

              Edit
            </button>

            <button
              type="button"
              onClick={() => handleStatusToggle(viewingRule)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                viewingRule.status === "ACTIVE"
                  ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                  : "border-green-200 bg-white text-green-600 hover:bg-green-50"
              }`}
            >
              <Power className="h-3.5 w-3.5" />

              {viewingRule.status === "ACTIVE"
                ? "Deactivate"
                : "Activate"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // main ui

  return (
    <div className="space-y-8">

      {/* header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Tax Deduction Rules
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={loadRules}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />

            Add Deduction Rule
          </button>

        </div>
      </div>

      {/* filters */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

          <div className="flex-1">
            <label
              htmlFor="filterTaxYear"
              className="block text-sm font-medium text-slate-700"
            >
              Tax Year
            </label>

            <select
              id="filterTaxYear"
              value={selectedTaxYear}
              onChange={(event) =>
                setSelectedTaxYear(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 md:w-48"
            >
              <option value="">All Tax Years</option>

              {taxYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="filterStatus"
              className="block text-sm font-medium text-slate-700"
            >
              Status
            </label>

            <select
              id="filterStatus"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 md:w-48"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="searchTerm"
              className="block text-sm font-medium text-slate-700"
            >
              Search
            </label>

            <form
              onSubmit={handleSearch}
              className="mt-2 flex"
            >
              <input
                id="searchTerm"
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Code or name..."
                className="w-full rounded-l-lg border border-r-0 border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 md:w-56"
              />

              <button
                type="submit"
                className="inline-flex items-center rounded-r-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* rules table */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-slate-100 p-3">
                <FileText className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Deduction Rules
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {rules.length} rule{rules.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : rules.length === 0 ? (
          <div className="px-6 py-16 text-center">

            <FileText className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 text-slate-500">
              No deduction rules found.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tax Year
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Calc Type
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rate
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Max Amount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {rules.map((rule, index) => (
                  <tr
                    key={rule.id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {index + 1}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {rule.tax_year}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-800">
                      {rule.deduction_code}
                    </td>

                    <td className="max-w-[200px] truncate px-5 py-4 text-sm text-slate-700">
                      {rule.deduction_name}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {rule.calculation_type}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                      {Number(rule.deduction_rate || 0).toFixed(2)}%
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                      {rule.maximum_amount !== null
                        ? `BDT ${formatMoney(rule.maximum_amount)}`
                        : "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          rule.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {rule.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() => handleViewDetail(rule)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />

                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(rule)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />

                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusToggle(rule)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                            rule.status === "ACTIVE"
                              ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                              : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />

                          {rule.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* create/edit modal */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingRule
                    ? "Edit Deduction Rule"
                    : "Add Deduction Rule"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingRule
                    ? "Update the selected deduction rule."
                    : "Configure a new tax deduction rule."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* tax year */}

                <div>
                  <label
                    htmlFor="form-tax-year"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Tax Year
                  </label>

                  {taxYears.length > 0 ? (
                    <select
                      id="form-tax-year"
                      name="tax_year"
                      value={form.tax_year}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="">Select tax year</option>

                      {taxYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="form-tax-year"
                      name="tax_year"
                      type="text"
                      value={form.tax_year}
                      onChange={handleChange}
                      required
                      placeholder="2026-27"
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                  )}
                </div>

                {/* deduction code */}

                <div>
                  <label
                    htmlFor="form-deduction-code"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Deduction Code
                  </label>

                  <input
                    id="form-deduction-code"
                    name="deduction_code"
                    type="text"
                    value={form.deduction_code}
                    onChange={handleChange}
                    required
                    placeholder="LIFE_INSURANCE"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Letters, numbers and underscores only.
                  </p>
                </div>

                {/* deduction name */}

                <div className="md:col-span-2">
                  <label
                    htmlFor="form-deduction-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Deduction Name
                  </label>

                  <input
                    id="form-deduction-name"
                    name="deduction_name"
                    type="text"
                    value={form.deduction_name}
                    onChange={handleChange}
                    required
                    placeholder="Life Insurance Premium"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {/* description */}

                <div className="md:col-span-2">
                  <label
                    htmlFor="form-description"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="form-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Optional description"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {/* income type */}

                <div>
                  <label
                    htmlFor="form-income-type"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Income Type
                  </label>

                  <input
                    id="form-income-type"
                    name="income_type"
                    type="text"
                    value={form.income_type}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {/* calculation type */}

                <div>
                  <label
                    htmlFor="form-calculation-type"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Calculation Type
                  </label>

                  <select
                    id="form-calculation-type"
                    name="calculation_type"
                    value={form.calculation_type}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  >
                    {CALCULATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* deduction rate */}

                <div>
                  <label
                    htmlFor="form-deduction-rate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Deduction Rate (%)
                  </label>

                  <input
                    id="form-deduction-rate"
                    name="deduction_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.deduction_rate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    placeholder="0"
                  />
                </div>

                {/* maximum amount */}

                <div>
                  <label
                    htmlFor="form-maximum-amount"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Maximum Amount
                  </label>

                  <input
                    id="form-maximum-amount"
                    name="maximum_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maximum_amount}
                    onChange={handleChange}
                    placeholder="Leave empty for no limit"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Leave empty for no maximum limit.
                  </p>
                </div>

                {/* effective from */}

                <div>
                  <label
                    htmlFor="form-effective-from"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Effective From
                  </label>

                  <input
                    id="form-effective-from"
                    name="effective_from"
                    type="date"
                    value={form.effective_from}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                {/* effective to */}

                <div>
                  <label
                    htmlFor="form-effective-to"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Effective To
                  </label>

                  <input
                    id="form-effective-to"
                    name="effective_to"
                    type="date"
                    value={form.effective_to}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Leave empty if there is no end date.
                  </p>
                </div>

              </div>

              {/* buttons */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {editingRule
                    ? "Update Rule"
                    : "Create Rule"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* confirmation dialog */}

      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <h3 className="text-lg font-semibold text-slate-900">
              {confirmDialog.title}
            </h3>

            <p className="mt-3 text-sm text-slate-600">
              {confirmDialog.message}
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Confirm
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

// detail item component

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <div className="mt-1.5 text-sm text-slate-800">
      {value}
    </div>
  </div>
);

export default AdminTaxDeductionRules;
