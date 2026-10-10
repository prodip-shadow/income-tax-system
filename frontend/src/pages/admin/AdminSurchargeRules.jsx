import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Pencil,
  X,
  Power,
  Search,
  Trash2,
  TrendingUp,
  Coins,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

import AdminSurchargeRuleService from "@/services/adminSurchargeRuleService";

const emptyForm = {
  tax_year: "2026-27",
  rule_name: "Above BDT 4 crore to BDT 10 crore",
  minimum_wealth: "40000000",
  maximum_wealth: "100000000",
  surcharge_rate: "10",
  status: "ACTIVE",
  effective_from: new Date().toISOString().split("T")[0],
  effective_to: "",
};

const PRESET_SURCHARGE_RULES = [
  {
    name: "Up to BDT 4 crore - Nil",
    minWealth: "0",
    maxWealth: "40000000",
    rate: "0",
  },
  {
    name: "Above BDT 4 crore to BDT 10 crore",
    minWealth: "40000000",
    maxWealth: "100000000",
    rate: "10",
  },
  {
    name: "Above BDT 10 crore to BDT 20 crore",
    minWealth: "100000000",
    maxWealth: "200000000",
    rate: "20",
  },
  {
    name: "Above BDT 20 crore to BDT 50 crore",
    minWealth: "200000000",
    maxWealth: "500000000",
    rate: "30",
  },
  {
    name: "Above BDT 50 crore",
    minWealth: "500000000",
    maxWealth: "",
    rate: "35",
  },
];

const AdminSurchargeRules = () => {
  const [rules, setRules] = useState([]);
  const [taxYears, setTaxYears] = useState(["2026-27", "2025-26", "2024-25", "2023-24"]);

  const [selectedTaxYear, setSelectedTaxYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [confirmDialog, setConfirmDialog] = useState(null);

  // Load available tax years
  const loadTaxYears = async () => {
    try {
      const res = await AdminSurchargeRuleService.getAvailableTaxYears();
      if (res?.data && res.data.length > 0) {
        setTaxYears(res.data);
      }
    } catch (err) {
      console.error("Failed to load tax years:", err);
    }
  };

  // Load all surcharge rules with filters
  const loadRules = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};
      if (selectedTaxYear) filters.tax_year = selectedTaxYear;
      if (selectedStatus) filters.status = selectedStatus;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const res = await AdminSurchargeRuleService.getAllRules(filters);
      setRules(res?.data || []);
    } catch (err) {
      console.error("Error loading surcharge rules:", err);
      setRules([]);
      setError(err?.response?.data?.message || "Failed to load surcharge rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxYears();
  }, []);

  useEffect(() => {
    loadRules();
  }, [selectedTaxYear, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRules();
  };

  const handleOpenAdd = () => {
    setEditingRule(null);
    setForm({
      ...emptyForm,
      tax_year: selectedTaxYear || taxYears[0] || "2026-27",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      tax_year: rule.tax_year || "2026-27",
      rule_name: rule.rule_name || "",
      minimum_wealth: rule.minimum_wealth !== null ? String(rule.minimum_wealth) : "0",
      maximum_wealth: rule.maximum_wealth !== null ? String(rule.maximum_wealth) : "",
      surcharge_rate: rule.surcharge_rate !== null ? String(rule.surcharge_rate) : "0",
      status: rule.status || "ACTIVE",
      effective_from: rule.effective_from ? rule.effective_from.split("T")[0] : "",
      effective_to: rule.effective_to ? rule.effective_to.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      rule_name: preset.name,
      minimum_wealth: preset.minWealth,
      maximum_wealth: preset.maxWealth,
      surcharge_rate: preset.rate,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tax_year) {
      toast.error("Tax year is required.");
      return;
    }
    if (!form.rule_name.trim()) {
      toast.error("Rule name is required.");
      return;
    }
    if (form.surcharge_rate === "" || Number(form.surcharge_rate) < 0 || Number(form.surcharge_rate) > 100) {
      toast.error("Surcharge rate must be between 0% and 100%.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        tax_year: form.tax_year,
        rule_name: form.rule_name.trim(),
        minimum_wealth: Number(form.minimum_wealth || 0),
        maximum_wealth: form.maximum_wealth !== "" ? Number(form.maximum_wealth) : null,
        surcharge_rate: Number(form.surcharge_rate),
        status: form.status,
        effective_from: form.effective_from || new Date().toISOString().split("T")[0],
        effective_to: form.effective_to || null,
      };

      if (editingRule) {
        await AdminSurchargeRuleService.updateRule(editingRule.id, payload);
        toast.success("Surcharge rule updated successfully!");
      } else {
        await AdminSurchargeRuleService.createRule(payload);
        toast.success("Surcharge rule created successfully!");
      }

      setShowModal(false);
      loadRules();
      loadTaxYears();
    } catch (err) {
      console.error("Save surcharge rule error:", err);
      toast.error(err?.response?.data?.message || "Failed to save surcharge rule.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (rule) => {
    const nextStatus = rule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await AdminSurchargeRuleService.toggleStatus(rule.id, nextStatus);
      toast.success(`Rule marked as ${nextStatus}!`);
      loadRules();
    } catch (err) {
      console.error("Toggle status error:", err);
      toast.error(err?.response?.data?.message || "Failed to toggle rule status.");
    }
  };

  const handleDelete = (rule) => {
    setConfirmDialog({
      title: "Delete Surcharge Rule?",
      message: `Are you sure you want to delete "${rule.rule_name}" for tax year ${rule.tax_year}? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await AdminSurchargeRuleService.deleteRule(rule.id);
          toast.success("Surcharge rule deleted successfully!");
          loadRules();
        } catch (err) {
          console.error("Delete rule error:", err);
          toast.error(err?.response?.data?.message || "Failed to delete surcharge rule.");
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === "") return "N/A (No Cap)";
    const num = Number(val);
    if (!Number.isFinite(num)) return "N/A";
    return `BDT ${num.toLocaleString("en-BD")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Surcharge Rules
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadRules();
              loadTaxYears();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Surcharge Slab
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Tax Year</label>
            <select
              value={selectedTaxYear}
              onChange={(e) => setSelectedTaxYear(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            >
              <option value="">All Tax Years</option>
              {taxYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Search</label>
            <form onSubmit={handleSearchSubmit} className="mt-1 relative flex">
              <input
                type="text"
                placeholder="Search code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Rules Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Tax Year</th>
                <th className="px-4 py-3.5">Surcharge Bracket / Rule Name</th>
                <th className="px-4 py-3.5">Wealth Range</th>
                <th className="px-4 py-3.5">Surcharge Rate</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Effective Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-purple-600" />
                    Loading wealth surcharge rules...
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No surcharge rules found for the selected criteria.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      AY {rule.tax_year}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{rule.rule_name}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{formatCurrency(rule.minimum_wealth)}</span>
                      {" to "}
                      <span className="font-semibold text-slate-900">{formatCurrency(rule.maximum_wealth)}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {rule.surcharge_rate}%
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          rule.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                            : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20"
                        }`}
                      >
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {rule.effective_from ? rule.effective_from.split("T")[0] : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(rule)}
                          title={`Mark as ${rule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}`}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Power className={`h-4 w-4 ${rule.status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"}`} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rule)}
                          title="Edit Rule"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-purple-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule)}
                          title="Delete Rule"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingRule ? "Edit Surcharge Rule" : "Add New Surcharge Rule"}
                  </h3>
                  <p className="text-xs text-slate-500">Configure wealth slab & percentage rate</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets for New Rules */}
            {!editingRule && (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-xs font-semibold text-slate-600">Quick Statutory Brackets:</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESET_SURCHARGE_RULES.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                    >
                      {p.name} ({p.rate}%)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Assessment Year *</label>
                  <select
                    value={form.tax_year}
                    onChange={(e) => setForm({ ...form, tax_year: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  >
                    {taxYears.map((y) => (
                      <option key={y} value={y}>
                        AY {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Rule Name / Description *</label>
                <input
                  type="text"
                  value={form.rule_name}
                  onChange={(e) => setForm({ ...form, rule_name: e.target.value })}
                  placeholder="e.g. Above BDT 4 crore to BDT 10 crore"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Minimum Wealth (BDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.minimum_wealth}
                    onChange={(e) => setForm({ ...form, minimum_wealth: e.target.value })}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-500">e.g. 40,000,000 for 4 Crore</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Maximum Wealth (BDT) <span className="text-slate-400">(Blank for Unlimited)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.maximum_wealth}
                    onChange={(e) => setForm({ ...form, maximum_wealth: e.target.value })}
                    placeholder="Leave empty for unlimited top slab"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">e.g. 100,000,000 for 10 Crore</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Surcharge Rate (%) *</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.surcharge_rate}
                    onChange={(e) => setForm({ ...form, surcharge_rate: e.target.value })}
                    placeholder="10"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">%</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Calculated as a percentage of regular tax payable</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Effective From</label>
                  <input
                    type="date"
                    value={form.effective_from}
                    onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Effective To <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={form.effective_to}
                    onChange={(e) => setForm({ ...form, effective_to: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingRule ? (
                    "Save Changes"
                  ) : (
                    "Create Surcharge Slab"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{confirmDialog.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSurchargeRules;
