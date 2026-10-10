import { useMemo } from "react";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Layers,
  Percent,
  PiggyBank,
  Receipt,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

// ============================================================================
// HELPERS
// ============================================================================

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatPercent = (value) => {
  return `${Number(value || 0)}%`;
};

const formatCategory = (category) => {
  if (!category) return "General";
  return String(category)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getDetailValue = (detail, camelCase, snakeCase) => {
  return detail?.[camelCase] ?? detail?.[snakeCase];
};

// Compact Step Header
const StepHeader = ({ stepNumber, title, subtitle, icon: Icon }) => (
  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
            Step {stepNumber}
          </span>
          <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// Compact Stat Card
const StatCard = ({ label, value, subtext, highlight = false, valueClassName = "text-slate-900" }) => (
  <div className={`rounded-xl border p-3.5 transition ${highlight ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 bg-white"}`}>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className={`mt-1 text-base font-bold tracking-tight ${valueClassName}`}>{value}</p>
    {subtext && <p className="mt-0.5 text-[11px] text-slate-400">{subtext}</p>}
  </div>
);

// ============================================================================
// MAIN COMPONENT: MINIMAL SEQUENTIAL CALCULATION DETAILS
// ============================================================================

const SequentialTaxCalculationDetails = ({
  calculation,
  onClose,
  showCloseButton = false,
  title = "Step-by-Step Tax Calculation Details",
}) => {
  // Normalize calculation data safely
  const data = useMemo(() => {
    if (!calculation) return null;

    const taxYear = calculation.taxYear ?? calculation.tax_year ?? "N/A";
    const category = calculation.category || "GENERAL";
    const totalIncome = Number(calculation.totalIncome ?? calculation.total_income ?? 0);
    const salaryIncome = Number(calculation.salaryIncome ?? calculation.salary_income ?? 0);
    const salaryExemption = Number(calculation.salaryExemption ?? calculation.salary_exemption ?? 0);
    const totalDeductionRaw = Number(
      calculation.totalDeduction ?? calculation.total_deduction ?? 0
    );
    const totalDeductibleExpense = Number(
      calculation.totalDeductibleExpense ??
        calculation.total_deductible_expense ??
        (totalDeductionRaw > 0 ? Math.max(0, totalDeductionRaw - salaryExemption) : 0)
    );
    const totalDeduction = totalDeductionRaw > 0
      ? totalDeductionRaw
      : salaryExemption + totalDeductibleExpense;
    const taxableIncome = Number(
      calculation.taxableIncome ?? calculation.taxable_income ?? Math.max(0, totalIncome - totalDeduction)
    );

    const maxSalaryCap = ["2025-26", "2026-27", "2025-2026", "2026-2027"].includes(String(taxYear)) ? 500000 : 450000;
    const oneThirdSalary = salaryIncome > 0 ? salaryIncome / 3 : 0;
    const hasSalary = salaryIncome > 0;
    const isSalaryCapApplied = hasSalary && oneThirdSalary > maxSalaryCap;
    const taxableSalary = Math.max(0, salaryIncome - salaryExemption);

    const taxFreeThreshold = Number(calculation.taxFreeThreshold ?? calculation.tax_free_threshold ?? 0);
    const disabledChildDependents = Number(
      calculation.disabledChildDependents ?? calculation.disabled_child_dependents ?? 0
    );
    const disabledChildAdditionalThreshold = Number(
      calculation.disabledChildAdditionalThreshold ?? calculation.disabled_child_additional_threshold ?? 0
    );
    const baseThreshold = Math.max(0, taxFreeThreshold - disabledChildAdditionalThreshold);

    const eligibleInvestment = Number(calculation.eligibleInvestment ?? calculation.eligible_investment ?? 0);
    const allowableInvestment = Number(calculation.allowableInvestment ?? calculation.allowable_investment ?? eligibleInvestment);
    const rebateRate = Number(calculation.rebateRate ?? calculation.rebate_rate ?? 15);
    const investmentBasedRebateLimit = Number(
      calculation.investmentBasedRebateLimit ?? calculation.investment_based_rebate_limit ?? eligibleInvestment * (rebateRate / 100)
    );
    const investmentLimitByIncome = Number(
      calculation.investmentLimitByIncome ?? calculation.investment_limit_by_income ?? taxableIncome * 0.03
    );
    const investmentMaximum = Number(calculation.investmentMaximum ?? calculation.investment_maximum ?? 1000000);

    const grossTax = Number(calculation.grossTax ?? calculation.gross_tax ?? 0);
    const taxRebate = Number(calculation.taxRebate ?? calculation.tax_rebate ?? 0);
    const taxAfterRebate = Number(
      calculation.taxAfterRebate ?? calculation.tax_after_rebate ?? Math.max(0, grossTax - taxRebate)
    );

    const minimumTax = Number(calculation.minimumTax ?? calculation.minimum_tax ?? 0);
    const minimumTaxArea = calculation.minimumTaxArea ?? calculation.minimum_tax_area ?? "N/A";
    const minimumTaxAreaName = calculation.minimumTaxAreaName ?? calculation.minimum_tax_area_name ?? null;
    const minimumTaxRuleType = calculation.minimumTaxRuleType ?? calculation.minimum_tax_rule_type ?? "AREA_BASED";
    const isNewTaxpayer = Boolean(calculation.isNewTaxpayer ?? calculation.is_new_taxpayer);
    const minimumTaxApplicable = Boolean(
      calculation.minimumTaxApplicable ?? calculation.minimum_tax_applicable ?? totalIncome > taxFreeThreshold
    );
    const minimumTaxApplied = Boolean(
      calculation.minimumTaxApplied ?? calculation.minimum_tax_applied ?? (minimumTaxApplicable && taxAfterRebate < minimumTax)
    );

    const taxLiability = Number(
      calculation.taxLiability ?? calculation.tax_liability ?? (minimumTaxApplicable ? Math.max(taxAfterRebate, minimumTax) : 0)
    );

    const netWealth = Number(calculation.netWealth ?? calculation.net_wealth ?? 0);
    const surchargeRate = Number(calculation.surchargeRate ?? calculation.surcharge_rate ?? 0);
    const surchargeAmount = Number(
      calculation.surchargeAmount ?? calculation.surcharge_amount ?? 0
    );
    const totalTaxPayable = Number(
      calculation.totalTaxPayable ?? calculation.total_tax_payable ?? (taxLiability + surchargeAmount)
    );

    const tdsAmount = Number(calculation.tdsAmount ?? calculation.tds_amount ?? 0);
    const advanceTaxAmount = Number(calculation.advanceTaxAmount ?? calculation.advance_tax_amount ?? 0);
    const totalTaxCredits = Number(calculation.totalTaxCredits ?? calculation.total_tax_credits ?? (tdsAmount + advanceTaxAmount));
    const finalPayable = Number(
      calculation.finalPayable ?? calculation.final_payable ?? (totalTaxPayable - totalTaxCredits)
    );

    const details = Array.isArray(calculation.details) ? calculation.details : [];

    return {
      taxYear,
      category,
      totalIncome,
      salaryIncome,
      salaryExemption,
      totalDeductibleExpense,
      totalDeduction,
      taxableIncome,
      maxSalaryCap,
      oneThirdSalary,
      hasSalary,
      isSalaryCapApplied,
      taxableSalary,
      baseThreshold,
      taxFreeThreshold,
      disabledChildDependents,
      disabledChildAdditionalThreshold,
      eligibleInvestment,
      allowableInvestment,
      rebateRate,
      investmentBasedRebateLimit,
      investmentLimitByIncome,
      investmentMaximum,
      grossTax,
      taxRebate,
      taxAfterRebate,
      minimumTax,
      minimumTaxArea,
      minimumTaxAreaName,
      minimumTaxRuleType,
      isNewTaxpayer,
      minimumTaxApplicable,
      minimumTaxApplied,
      taxLiability,
      netWealth,
      surchargeRate,
      surchargeAmount,
      totalTaxPayable,
      tdsAmount,
      advanceTaxAmount,
      totalTaxCredits,
      finalPayable,
      details,
    };
  }, [calculation]);

  // Normalized sequential slabs list to prevent duplicate 0% threshold slabs
  const slabsToRender = useMemo(() => {
    if (!data) return [];
    if (!data.details || data.details.length === 0) {
      return [
        {
          key: "slab-1",
          slabOrder: 1,
          label: "Slab 1 (Tax-Free)",
          rangeText: `BDT 0.00 – BDT ${formatMoney(data.taxFreeThreshold)}`,
          rateText: "0%",
          taxable: Math.min(data.taxableIncome, data.taxFreeThreshold),
          tax: 0,
        },
      ];
    }

    // Check if the backend details already provided the 0% tax-free slab (usually at index 0)
    const firstRate = Number(getDetailValue(data.details[0], "taxRate", "tax_rate") || 0);

    if (firstRate === 0) {
      return data.details.map((slab, idx) => {
        const minInc = Number(getDetailValue(slab, "minimumIncome", "minimum_income") || 0);
        const maxInc = getDetailValue(slab, "maximumIncome", "maximum_income");
        const rate = Number(getDetailValue(slab, "taxRate", "tax_rate") || 0);
        const taxable = Number(getDetailValue(slab, "taxableAmount", "taxable_amount") || 0);
        const calcTax = Number(getDetailValue(slab, "calculatedTax", "calculated_tax") || 0);
        const slabOrder = Number(getDetailValue(slab, "slabOrder", "slab_order") || (idx + 1));

        return {
          key: slab.id || `slab-${slabOrder}`,
          slabOrder,
          label: slabOrder === 1 || rate === 0 ? `Slab ${slabOrder} (Tax-Free)` : `Slab ${slabOrder}`,
          rangeText:
            maxInc === null || maxInc === "" || maxInc === undefined
              ? `BDT ${formatMoney(minInc)} – Remaining Above`
              : `BDT ${formatMoney(minInc)} – BDT ${formatMoney(maxInc)}`,
          rateText: formatPercent(rate),
          taxable,
          tax: calcTax,
        };
      });
    }

    // If backend details did NOT include 0% slab, prepend Slab 1 (Tax-Free)
    const zeroSlab = {
      key: "slab-1",
      slabOrder: 1,
      label: "Slab 1 (Tax-Free)",
      rangeText: `BDT 0.00 – BDT ${formatMoney(data.taxFreeThreshold)}`,
      rateText: "0%",
      taxable: Math.min(data.taxableIncome, data.taxFreeThreshold),
      tax: 0,
    };

    const progressiveSlabs = data.details.map((slab, idx) => {
      const minInc = Number(getDetailValue(slab, "minimumIncome", "minimum_income") || 0);
      const maxInc = getDetailValue(slab, "maximumIncome", "maximum_income");
      const rate = Number(getDetailValue(slab, "taxRate", "tax_rate") || 0);
      const taxable = Number(getDetailValue(slab, "taxableAmount", "taxable_amount") || 0);
      const calcTax = Number(getDetailValue(slab, "calculatedTax", "calculated_tax") || 0);
      const slabOrder = idx + 2;

      return {
        key: slab.id || `slab-${slabOrder}`,
        slabOrder,
        label: `Slab ${slabOrder}`,
        rangeText:
          maxInc === null || maxInc === "" || maxInc === undefined
            ? `BDT ${formatMoney(minInc)} – Remaining Above`
            : `BDT ${formatMoney(minInc)} – BDT ${formatMoney(maxInc)}`,
        rateText: formatPercent(rate),
        taxable,
        tax: calcTax,
      };
    });

    return [zeroSlab, ...progressiveSlabs];
  }, [data]);

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* ====================================================================
          TOP BANNER & 7-STEP WORKFLOW
      ==================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{title}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  AY {data.taxYear}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Category: {formatCategory(data.category)}
            </span>
            {showCloseButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Close
              </button>
            )}
          </div>
        </div>

        {/* 7-Step Stepper Bar */}
        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex items-center min-w-[650px] gap-1 text-xs font-medium text-slate-600">
            {[
              { num: 1, label: "Gross Income" },
              { num: 2, label: "Deductions" },
              { num: 3, label: "Tax Slabs" },
              { num: 4, label: "Tax Rebate" },
              { num: 5, label: "Minimum Tax" },
              { num: 6, label: "Surcharge" },
              { num: 7, label: "Net Settlement" },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-1 w-full">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                    {step.num}
                  </span>
                  <span className="truncate text-slate-800 font-medium text-[11px]">{step.label}</span>
                </div>
                {idx < 6 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 mx-0.5" />}
              </div>
            ))}
          </div>
        </div>

        {/* 4 Summary Highlight Cards */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
            <p className="text-[11px] font-medium text-slate-500">1. Total Gross Income</p>
            <p className="mt-1 text-base font-bold text-slate-900">BDT {formatMoney(data.totalIncome)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
            <p className="text-[11px] font-medium text-slate-500">2. Net Taxable Income</p>
            <p className="mt-1 text-base font-bold text-slate-900">BDT {formatMoney(data.taxableIncome)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
            <p className="text-[11px] font-medium text-slate-500">5. Net Tax Liability</p>
            <p className="mt-1 text-base font-bold text-slate-900">BDT {formatMoney(data.taxLiability)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
            <p className="text-[11px] font-medium text-slate-500">7. Final Settlement</p>
            <p className="mt-1 text-base font-bold text-slate-900">
              {Number(data.finalPayable) < 0
                ? `Refund BDT ${formatMoney(Math.abs(data.finalPayable))}`
                : `BDT ${formatMoney(data.finalPayable)}`}
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          STEP 1: TOTAL GROSS INCOME & TAX-FREE THRESHOLD
      ==================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <StepHeader
          stepNumber={1}
          title="Total Gross Income & Tax-Free Threshold"
          subtitle="Taxpayer category, gross income, and tax-free threshold"
          icon={CircleDollarSign}
        />

        <div className="p-4">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <StatCard
              label="Taxpayer Category"
              value={formatCategory(data.category)}
              subtext={`Assessment Year ${data.taxYear}`}
            />
            <StatCard
              label="Gross Income (All Heads)"
              value={`BDT ${formatMoney(data.totalIncome)}`}
              subtext="Total receipts from all heads"
            />
            <StatCard
              label="Tax-Free Exemption Threshold"
              value={`BDT ${formatMoney(data.taxFreeThreshold)}`}
              subtext={
                data.disabledChildDependents > 0
                  ? `Includes +BDT ${formatMoney(data.disabledChildAdditionalThreshold)} allowance`
                  : "0% rate applies up to this limit"
              }
              highlight
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          STEP 2: ALLOWABLE DEDUCTIONS & NET TAXABLE INCOME
      ==================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <StepHeader
          stepNumber={2}
          title="Allowable Deductions & Net Taxable Income"
          subtitle="Salary exemption and business expenses subtracted from gross income"
          icon={PiggyBank}
        />

        <div className="p-4 space-y-3">
          {/* 3 Metric Cards */}
          <div className="grid gap-2.5 sm:grid-cols-3">
            <StatCard
              label="Salary Exemption"
              value={`− BDT ${formatMoney(data.salaryExemption)}`}
              subtext={
                data.hasSalary
                  ? `1/3 of salary or capped ceiling`
                  : "No salary receipts declared"
              }
            />
            <StatCard
              label="Deductible Business Expenses"
              value={`− BDT ${formatMoney(data.totalDeductibleExpense)}`}
              subtext="Allowable operating expenses"
            />
            <StatCard
              label="Total Deductions"
              value={`BDT ${formatMoney(data.totalDeduction)}`}
              subtext="Salary Exemption + Business Expenses"
              highlight
            />
          </div>

          {/* Clean Itemized Computation Ledger */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
            <table className="min-w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-700">1. Total Gross Receipts (All Heads)</td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900">BDT {formatMoney(data.totalIncome)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-700">
                    2. Less: Salary Exemption
                    {data.hasSalary && (
                      <span className="text-slate-400 font-normal ml-1.5">
                        (Gross Salary: BDT {formatMoney(data.salaryIncome)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">− BDT {formatMoney(data.salaryExemption)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-700">3. Less: Deductible Business Expenses</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">− BDT {formatMoney(data.totalDeductibleExpense)}</td>
                </tr>
                <tr className="bg-slate-100/70 font-semibold border-t border-slate-200">
                  <td className="px-4 py-2.5 text-slate-800">Total Deductions Allowed</td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900">− BDT {formatMoney(data.totalDeduction)}</td>
                </tr>
                <tr className="bg-emerald-50/50 font-bold border-t-2 border-emerald-300">
                  <td className="px-4 py-3 text-slate-900 text-sm">Net Taxable Income (Carried to Step 3)</td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-900 text-base">BDT {formatMoney(data.taxableIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================================================================
          STEP 3: PROGRESSIVE TAX SLABS & GROSS TAX
      ==================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <StepHeader
          stepNumber={3}
          title="Sequential Progressive Tax Slabs & Gross Tax"
          subtitle="Graduated progressive tax brackets applied slab-by-slab to compute gross tax"
          icon={Calculator}
        />

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="px-4 py-2.5 text-left">Slab</th>
                <th className="px-4 py-2.5 text-left">Income Bracket Range</th>
                <th className="px-4 py-2.5 text-right">Tax Rate</th>
                <th className="px-4 py-2.5 text-right">Taxable in Slab</th>
                <th className="px-4 py-2.5 text-right">Calculated Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slabsToRender.map((slab) => (
                <tr key={slab.key} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{slab.label}</td>
                  <td className="px-4 py-2.5 text-slate-600">{slab.rangeText}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-700">{slab.rateText}</td>
                  <td className="px-4 py-2.5 text-right text-slate-700">BDT {formatMoney(slab.taxable)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">BDT {formatMoney(slab.tax)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50/70 font-bold">
                <td colSpan={4} className="px-4 py-2.5 text-right text-slate-800">
                  Total Initial Gross Tax:
                </td>
                <td className="px-4 py-2.5 text-right text-slate-900 text-sm">
                  BDT {formatMoney(data.grossTax)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ====================================================================
          STEP 4: INVESTMENT TAX REBATE
      ==================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <StepHeader
          stepNumber={4}
          title="Investment Tax Rebate"
          subtitle="Tax credit computed as the lowest of 15% of investment, 3% of income, and cap"
          icon={Percent}
        />

        <div className="p-4 space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-4">
            <StatCard
              label="Allowable Investment"
              value={`BDT ${formatMoney(data.allowableInvestment)}`}
              subtext="Eligible instruments"
            />
            <StatCard
              label="15% of Investment"
              value={`BDT ${formatMoney(data.investmentBasedRebateLimit)}`}
              subtext="Criterion A"
            />
            <StatCard
              label="3% of Taxable Income"
              value={`BDT ${formatMoney(data.investmentLimitByIncome)}`}
              subtext="Criterion B"
            />
            <StatCard
              label="Maximum Rebate Limit"
              value={`BDT ${formatMoney(data.investmentMaximum)}`}
              subtext="Criterion C"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">Rebate Reconciliation:</span>
            <div className="flex flex-wrap items-center gap-4">
              <span>Gross Tax: <strong className="text-slate-900">BDT {formatMoney(data.grossTax)}</strong></span>
              <span>Rebate: <strong className="text-slate-900">− BDT {formatMoney(data.taxRebate)}</strong></span>
              <span className="border-l border-slate-200 pl-4">Tax After Rebate: <strong className="text-slate-900 font-bold">BDT {formatMoney(data.taxAfterRebate)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          STEP 5: MINIMUM TAX & TAX LIABILITY
      ==================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <StepHeader
          stepNumber={5}
          title="Minimum Tax Verification & Net Tax Liability"
          subtitle="Verifies and applies jurisdictional minimum tax floor"
          icon={ShieldCheck}
        />

        <div className="p-4 space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <StatCard
              label="Jurisdiction / Area"
              value={
                data.minimumTaxRuleType === "TAXPAYER_TYPE"
                  ? data.isNewTaxpayer || data.minimumTaxArea === "NEW_TAXPAYER"
                    ? "First-Time Filer"
                    : "Regular Taxpayer"
                  : data.minimumTaxAreaName || formatCategory(data.minimumTaxArea)
              }
              subtext={data.minimumTaxApplicable ? "Taxable income exceeds threshold" : "Below threshold"}
            />
            <StatCard
              label="Minimum Tax Floor"
              value={`BDT ${formatMoney(data.minimumTax)}`}
              subtext="Baseline minimum"
            />
            <StatCard
              label="Minimum Tax Status"
              value={data.minimumTaxApplied ? "Floor Applied" : "Met / Exceeded"}
              subtext={
                data.minimumTaxApplied
                  ? `Raised from BDT ${formatMoney(data.taxAfterRebate)}`
                  : `Tax after rebate meets floor`
              }
              highlight={data.minimumTaxApplied}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Tax Liability = Max(Tax After Rebate: BDT {formatMoney(data.taxAfterRebate)}, Minimum: BDT {formatMoney(data.minimumTax)})
            </span>
            <span className="font-bold text-slate-900 text-sm">
              Net Tax Liability: BDT {formatMoney(data.taxLiability)}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          STEP 6: WEALTH SURCHARGE
      ==================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <StepHeader
          stepNumber={6}
          title="Net Wealth Surcharge"
          subtitle="Progressive surcharge assessment on individual net wealth"
          icon={TrendingUp}
        />

        <div className="p-4">
          <div className="grid gap-2.5 sm:grid-cols-4">
            <StatCard
              label="Declared Net Wealth"
              value={`BDT ${formatMoney(data.netWealth)}`}
              subtext="Total assets less liabilities"
            />
            <StatCard
              label="Surcharge Rate"
              value={formatPercent(data.surchargeRate)}
              subtext={Number(data.surchargeRate) > 0 ? "Progressive rate" : "Below 4 Crore threshold"}
            />
            <StatCard
              label="Surcharge Amount"
              value={`+ BDT ${formatMoney(data.surchargeAmount)}`}
              subtext={`${formatPercent(data.surchargeRate)} of Tax Liability`}
            />
            <StatCard
              label="Total Tax Payable"
              value={`BDT ${formatMoney(data.totalTaxPayable)}`}
              subtext="Tax Liability + Surcharge"
              highlight
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          STEP 7: PREPAID TAX CREDITS & FINAL SETTLEMENT
      ==================================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <StepHeader
          stepNumber={7}
          title="Prepaid Tax Credits & Final Settlement"
          subtitle="Reconciliation of advance tax and TDS against total tax payable"
          icon={Receipt}
        />

        <div className="p-4 space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <StatCard
              label="Tax Deducted at Source (TDS)"
              value={`BDT ${formatMoney(data.tdsAmount)}`}
              subtext="Withheld at source"
            />
            <StatCard
              label="Advance Income Tax (AIT)"
              value={`BDT ${formatMoney(data.advanceTaxAmount)}`}
              subtext="Installment payments"
            />
            <StatCard
              label="Total Prepaid Credits"
              value={`BDT ${formatMoney(data.totalTaxCredits)}`}
              subtext="TDS + Advance Tax"
              highlight
            />
          </div>

          {/* Minimal Final Settlement Card */}
          <div
            className={`rounded-xl p-4 border ${
              Number(data.finalPayable) < 0
                ? "bg-emerald-50/50 border-emerald-300"
                : Number(data.finalPayable) > 0
                ? "bg-amber-50/40 border-amber-300"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      Number(data.finalPayable) < 0
                        ? "bg-emerald-100 text-emerald-800"
                        : Number(data.finalPayable) > 0
                        ? "bg-amber-100 text-amber-900"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {Number(data.finalPayable) < 0
                      ? "REFUND FROM NBR"
                      : Number(data.finalPayable) > 0
                      ? "NET TAX PAYABLE"
                      : "ZERO LIABILITY"}
                  </span>
                  <span className="text-xs text-slate-500">Tax Year {data.taxYear}</span>
                </div>
                <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  BDT {formatMoney(Math.abs(Number(data.finalPayable)))}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 sm:border-l sm:border-slate-200 sm:pl-5">
                <div>
                  <span className="text-slate-400">Total Tax: </span>
                  <strong className="text-slate-900">BDT {formatMoney(data.totalTaxPayable)}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Credits: </span>
                  <strong className="text-slate-900">− BDT {formatMoney(data.totalTaxCredits)}</strong>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400">Final Balance: </span>
                  <strong className="text-slate-900 font-bold">
                    {Number(data.finalPayable) < 0
                      ? `Refund BDT ${formatMoney(Math.abs(data.finalPayable))}`
                      : `BDT ${formatMoney(data.finalPayable)}`}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequentialTaxCalculationDetails;
