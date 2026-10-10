import { useEffect, useState } from "react";
import {
  Calculator,
  Plus,
  RefreshCw,
  Pencil,
  X,
  Power,
} from "lucide-react";

import toast from "react-hot-toast";

import TaxRuleService from "@/services/taxRuleService";

const emptyForm = {
  tax_year: "",
  minimum_income: "",
  maximum_income: "",
  tax_rate: "",
  fixed_amount: "0",
  effective_from: "",
  effective_to: "",
};

const AdminTaxRules = () => {
  const [taxYears, setTaxYears] = useState([]);
  const [selectedTaxYear, setSelectedTaxYear] = useState("");

  const [rules, setRules] = useState([]);

  const [taxYearStatus, setTaxYearStatus] =
    useState("INACTIVE");

  const [loadingYears, setLoadingYears] =
    useState(true);

  const [loadingRules, setLoadingRules] =
    useState(false);

  const [loadingStatus, setLoadingStatus] =
    useState(false);

  const [statusUpdating, setStatusUpdating] =
    useState(false);

  const [error, setError] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingRule, setEditingRule] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const [creatingNewTaxYear, setCreatingNewTaxYear] =
    useState(false);

  // load tax years

  const loadTaxYears = async () => {
    try {
      setLoadingYears(true);
      setError("");

      const response =
        await TaxRuleService.getAvailableTaxYears();

      const years = response.data || [];

      setTaxYears(years);

      if (years.length > 0) {
        setSelectedTaxYear((currentYear) => {
          return currentYear || years[0];
        });
      }
    } catch (error) {
      console.error(
        "Tax year loading error:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load tax years.",
      );
    } finally {
      setLoadingYears(false);
    }
  };

  // load all tax rules
  // admin

  const loadRules = async (taxYear) => {
    if (!taxYear) {
      setRules([]);
      return;
    }

    try {
      setLoadingRules(true);
      setError("");

      const response =
        await TaxRuleService.getAllTaxRules(
          taxYear,
        );

      setRules(response.data || []);
    } catch (error) {
      console.error(
        "Tax rules loading error:",
        error,
      );

      setRules([]);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load tax rules.",
      );
    } finally {
      setLoadingRules(false);
    }
  };

  // load tax year status

  const loadTaxYearStatus = async (taxYear) => {
    if (!taxYear) {
      setTaxYearStatus("INACTIVE");
      return;
    }

    try {
      setLoadingStatus(true);

      const response =
        await TaxRuleService.getTaxYearStatus(
          taxYear,
        );

      const status =
        response?.data?.status || "INACTIVE";

      setTaxYearStatus(status);
    } catch (error) {
      console.error(
        "Tax year status loading error:",
        error,
      );

      setTaxYearStatus("INACTIVE");
    } finally {
      setLoadingStatus(false);
    }
  };


  useEffect(() => {
    let cancelled = false;

    TaxRuleService.getAvailableTaxYears()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const years = response?.data || [];

        setTaxYears(years);

        if (years.length > 0) {
          setSelectedTaxYear((currentYear) => {
            return currentYear || years[0];
          });
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Tax year loading error:",
          error,
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load tax years.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingYears(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // tax year change

  useEffect(() => {
    if (!selectedTaxYear) {
      return;
    }

    let cancelled = false;

    Promise.all([
      TaxRuleService.getAllTaxRules(
        selectedTaxYear,
      ),
      TaxRuleService.getTaxYearStatus(
        selectedTaxYear,
      ),
    ])
      .then(([rulesResponse, statusResponse]) => {
        if (cancelled) {
          return;
        }

        setRules(rulesResponse?.data || []);

        setTaxYearStatus(
          statusResponse?.data?.status ||
            "INACTIVE",
        );

        setError("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Tax year data loading error:",
          error,
        );

        setRules([]);

        setTaxYearStatus("INACTIVE");

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load tax rules.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingRules(false);
          setLoadingStatus(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTaxYear]);

  // form handler

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  // open create form
  // existing tax year

  const handleCreate = () => {
    setEditingRule(null);
    setCreatingNewTaxYear(false);

    setForm({
      ...emptyForm,
      tax_year: selectedTaxYear,
    });

    setShowForm(true);
  };

  // open new tax year form

  const handleCreateTaxYear = () => {
    setEditingRule(null);
    setCreatingNewTaxYear(true);

    setForm({
      ...emptyForm,
      tax_year: "",
      fixed_amount: "0",
    });

    setShowForm(true);
  };

  // open edit form

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setCreatingNewTaxYear(false);

    setForm({
      tax_year: rule.tax_year || "",

      minimum_income:
        rule.minimum_income ?? "",

      maximum_income:
        rule.maximum_income ?? "",

      tax_rate:
        rule.tax_rate ?? "",

      fixed_amount:
        rule.fixed_amount ?? "0",

      effective_from:
        rule.effective_from
          ? String(rule.effective_from).slice(
              0,
              10,
            )
          : "",

      effective_to:
        rule.effective_to
          ? String(rule.effective_to).slice(
              0,
              10,
            )
          : "",
    });

    setShowForm(true);
  };

  // close form

  const handleCloseForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingRule(null);
    setCreatingNewTaxYear(false);
    setForm(emptyForm);
  };

  // save tax rule

  const handleSubmit = async (event) => {
    event.preventDefault();

    // new tax year validation

    if (creatingNewTaxYear) {
      const taxYearPattern = /^\d{4}-\d{2}$/;

      if (!taxYearPattern.test(form.tax_year)) {
        toast.error(
          "Tax year must be in YYYY-YY format.",
        );

        return;
      }

      if (taxYears.includes(form.tax_year)) {
        toast.error(
          "This tax year already exists.",
        );

        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        tax_year: form.tax_year,

        minimum_income:
          Number(form.minimum_income),

        maximum_income:
          form.maximum_income === ""
            ? null
            : Number(form.maximum_income),

        tax_rate:
          Number(form.tax_rate),

        fixed_amount:
          form.fixed_amount === ""
            ? 0
            : Number(form.fixed_amount),

        effective_from:
          form.effective_from,

        effective_to:
          form.effective_to === ""
            ? null
            : form.effective_to,
      };

      if (editingRule) {
        await TaxRuleService.updateTaxRule(
          editingRule.id,
          payload,
        );

        toast.success(
          "Tax rule updated successfully.",
        );
      } else {
        await TaxRuleService.createTaxRule(
          payload,
        );

        if (creatingNewTaxYear) {
          toast.success(
            `${payload.tax_year} tax year created successfully.`,
          );
        } else {
          toast.success(
            "Tax rule created successfully.",
          );
        }
      }

      setShowForm(false);
      setEditingRule(null);
      setCreatingNewTaxYear(false);
      setForm(emptyForm);

      await loadTaxYears();

      await loadRules(
        payload.tax_year,
      );

      await loadTaxYearStatus(
        payload.tax_year,
      );

      setSelectedTaxYear(
        payload.tax_year,
      );
    } catch (error) {
      console.error(
        "Tax rule save error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save tax rule.",
      );
    } finally {
      setSaving(false);
    }
  };

  // change tax year status

  const handleTaxYearStatusChange =
    async () => {
      if (!selectedTaxYear) {
        return;
      }

      const nextStatus =
        taxYearStatus === "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      const action =
        nextStatus === "ACTIVE"
          ? "activate"
          : "deactivate";

      const confirmed = window.confirm(
        `Are you sure you want to ${action} the entire ${selectedTaxYear} tax year?`,
      );

      if (!confirmed) {
        return;
      }

      try {
        setStatusUpdating(true);

        await TaxRuleService.updateTaxYearStatus(
          selectedTaxYear,
          nextStatus,
        );

        setTaxYearStatus(nextStatus);

        toast.success(
          `Tax year ${selectedTaxYear} ${action}d successfully.`,
        );

        await loadRules(
          selectedTaxYear,
        );

        await loadTaxYearStatus(
          selectedTaxYear,
        );
      } catch (error) {
        console.error(
          "Tax year status update error:",
          error,
        );

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update tax year status.",
        );
      } finally {
        setStatusUpdating(false);
      }
    };

  // refresh current tax year

  const handleRefresh = async () => {
    if (!selectedTaxYear) {
      return;
    }

    await Promise.all([
      loadRules(selectedTaxYear),
      loadTaxYearStatus(selectedTaxYear),
    ]);
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

    return Number(value).toLocaleString(
      "en-BD",
      {
        maximumFractionDigits: 2,
      },
    );
  };

  // loading

  if (loadingYears) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-slate-500" />

          <p className="mt-3 text-sm text-slate-500">
            Loading tax rules...
          </p>
        </div>
      </div>
    );
  }

  // main ui

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Tax Slabs
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              loadingRules ||
              loadingStatus
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loadingRules ||
                loadingStatus
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

          {/* NEW TAX YEAR */}

          <button
            type="button"
            onClick={handleCreateTaxYear}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />

            New Tax Year
          </button>

          {/* ADD TAX RULE */}

          <button
            type="button"
            onClick={handleCreate}
            disabled={!selectedTaxYear}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />

            Add Tax Rule
          </button>

        </div>
      </div>

      {/* =====================================================
          TAX YEAR SELECTOR + STATUS
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div className="flex-1">

            <label
              htmlFor="taxYear"
              className="block text-sm font-medium text-slate-700"
            >
              Tax Year
            </label>

            <p className="mt-1 text-xs text-slate-400">
              Select the tax year whose rules you want
              to manage.
            </p>

            <select
              id="taxYear"
              value={selectedTaxYear}
              onChange={(event) =>
                setSelectedTaxYear(
                  event.target.value,
                )
              }
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 md:w-64"
            >
              {taxYears.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>

          </div>

          {/* TAX YEAR STATUS */}

          <div className="flex items-center gap-4">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Tax Year Status
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    taxYearStatus === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {loadingStatus
                    ? "Loading..."
                    : taxYearStatus}
                </span>

              </div>
            </div>

            <button
              type="button"
              onClick={
                handleTaxYearStatusChange
              }
              disabled={
                statusUpdating ||
                loadingStatus ||
                !selectedTaxYear
              }
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                taxYearStatus === "ACTIVE"
                  ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                  : "border-green-200 bg-white text-green-600 hover:bg-green-50"
              }`}
            >
              {statusUpdating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}

              {taxYearStatus === "ACTIVE"
                ? "Deactivate Year"
                : "Activate Year"}
            </button>

          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          RULE TABLE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="border-b border-slate-200 px-6 py-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-slate-100 p-3">
                <Calculator className="h-5 w-5 text-slate-700" />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Tax Slabs
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedTaxYear ||
                    "No tax year selected"}
                </p>

              </div>
            </div>

            {/* STATUS BADGE */}

            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                taxYearStatus === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {taxYearStatus === "ACTIVE"
                ? "Active Tax Year"
                : "Inactive Tax Year"}
            </span>

          </div>
        </div>

        {/* TABLE */}

        {loadingRules ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : rules.length === 0 ? (
          <div className="px-6 py-16 text-center">

            <Calculator className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 text-slate-500">
              No tax rules found for this tax year.
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
                    Minimum Income
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Maximum Income
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tax Rate
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fixed Amount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Effective From
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {rules.map(
                  (rule, index) => (
                    <tr
                      key={rule.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                        BDT{" "}
                        {formatMoney(
                          rule.minimum_income,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                        {rule.maximum_income ===
                        null
                          ? "Above"
                          : `BDT ${formatMoney(
                              rule.maximum_income,
                            )}`}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                        {Number(
                          rule.tax_rate,
                        ).toFixed(2)}
                        %
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900">
                        BDT{" "}
                        {formatMoney(
                          rule.fixed_amount,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {rule.effective_from
                          ? String(
                              rule.effective_from,
                            ).slice(
                              0,
                              10,
                            )
                          : "—"}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                rule,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />

                            Edit
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

      </section>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-semibold text-slate-900">

                  {editingRule
                    ? "Edit Tax Rule"
                    : creatingNewTaxYear
                    ? "Create New Tax Year"
                    : "Add Tax Rule"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {editingRule
                    ? "Update the selected tax slab."
                    : creatingNewTaxYear
                    ? "Create a new tax year with its first tax slab."
                    : "Configure a new tax slab for the selected tax year."}

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

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* TAX YEAR */}

                <div>

                  <label
                    htmlFor="form-tax-year"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Tax Year
                  </label>

                  {creatingNewTaxYear ? (
                    <>
                      <input
                        id="form-tax-year"
                        name="tax_year"
                        type="text"
                        value={form.tax_year}
                        onChange={handleChange}
                        required
                        placeholder="2027-28"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                      />

                      <p className="mt-1 text-xs text-slate-400">
                        Format: YYYY-YY, for example
                        2027-28.
                      </p>
                    </>
                  ) : (
                    <select
                      id="form-tax-year"
                      name="tax_year"
                      value={form.tax_year}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      {taxYears.map(
                        (year) => (
                          <option
                            key={year}
                            value={year}
                          >
                            {year}
                          </option>
                        ),
                      )}
                    </select>
                  )}

                </div>

                {/* TAX RATE */}

                <div>

                  <label
                    htmlFor="tax-rate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Tax Rate (%)
                  </label>

                  <input
                    id="tax-rate"
                    name="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.tax_rate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    placeholder="e.g. 10"
                  />

                </div>

                {/* MINIMUM INCOME */}

                <div>

                  <label
                    htmlFor="minimum-income"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Minimum Income
                  </label>

                  <input
                    id="minimum-income"
                    name="minimum_income"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.minimum_income
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    placeholder="Minimum income"
                  />

                </div>

                {/* MAXIMUM INCOME */}

                <div>

                  <label
                    htmlFor="maximum-income"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Maximum Income
                  </label>

                  <input
                    id="maximum-income"
                    name="maximum_income"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.maximum_income
                    }
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    placeholder="Leave empty for unlimited"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Leave empty for the final/open-ended
                    slab.
                  </p>

                </div>

                {/* FIXED AMOUNT */}

                <div>

                  <label
                    htmlFor="fixed-amount"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Fixed Amount
                  </label>

                  <input
                    id="fixed-amount"
                    name="fixed_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.fixed_amount
                    }
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                    placeholder="0"
                  />

                </div>

                {/* EFFECTIVE FROM */}

                <div>

                  <label
                    htmlFor="effective-from"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Effective From
                  </label>

                  <input
                    id="effective-from"
                    name="effective_from"
                    type="date"
                    value={
                      form.effective_from
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />

                </div>

                {/* EFFECTIVE TO */}

                <div>

                  <label
                    htmlFor="effective-to"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Effective To
                  </label>

                  <input
                    id="effective-to"
                    name="effective_to"
                    type="date"
                    value={
                      form.effective_to
                    }
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Leave empty if there is no end date.
                  </p>

                </div>

              </div>

              {/* NEW TAX YEAR INFO */}

              {creatingNewTaxYear && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">

                  <p className="text-sm font-medium text-blue-800">
                    New Tax Year
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    This will create the first tax slab
                    for the new tax year. The new tax
                    year will remain inactive until all
                    required slabs are added and the year
                    is activated.
                  </p>

                </div>
              )}

              {/* BUTTONS */}

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
                    : creatingNewTaxYear
                    ? "Create Tax Year"
                    : "Create Rule"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminTaxRules;