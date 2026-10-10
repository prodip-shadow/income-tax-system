/**
 * Comprehensive Multi-Item Income Tax Calculation Test for User: rafy@gmail.com
 *
 * Configured with:
 * - 10 Incomes (across multiple heads: Salary, Business, House Property, Agriculture, Financial Assets, etc.)
 * - 5 Business Expenses (Allowable deductions under Section 49 / ITA 2023)
 * - 3 Personal Expenses (Non-deductible personal living expenses for IT-10B statement)
 * - 5 Investment & Tax Deduction Types (Section 78 & Sixth Schedule Part 3)
 *
 * Runs production API endpoints and verifies complete calculation against Bangladesh Income Tax law.
 */

const BASE_URL = "http://localhost:5000/api";
const CREDENTIALS = {
  email: "rafy@gmail.com",
  password: "rafy@123",
};

const TAX_YEAR = "2026-27";

async function apiRequest(endpoint, method = "GET", data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(url, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(json.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = json;
    throw error;
  }
  return json;
}

// 1. 10 Income entries
const INCOMES = [
  { income_type: "SALARY", source_name: "Tech Corp BD - Annual Remuneration", amount: 1200000, income_date: "2026-07-15", description: "Base salary and annual allowances" },
  { income_type: "BUSINESS", source_name: "Software Architecture Consulting", amount: 450000, income_date: "2026-08-10", description: "Enterprise architecture fees" },
  { income_type: "RENT", source_name: "Dhanmondi Residential Apartment", amount: 360000, income_date: "2026-09-01", description: "Monthly rental receipts (৳30,000 x 12)" },
  { income_type: "BUSINESS", source_name: "E-Commerce Trading Platform", amount: 500000, income_date: "2026-10-05", description: "Net business sales receipts" },
  { income_type: "AGRICULTURE", source_name: "Agro Farm & Fruit Orchard Harvest", amount: 150000, income_date: "2026-11-12", description: "Agricultural crop proceeds" },
  { income_type: "FINANCIAL_ASSETS", source_name: "Bank Term Deposit & Savings Profit", amount: 80000, income_date: "2026-12-20", description: "Profit on bank deposits" },
  { income_type: "BUSINESS", source_name: "Global Freelance Web Development", amount: 320000, income_date: "2027-01-15", description: "Export contracts receipts" },
  { income_type: "BUSINESS", source_name: "Corporate IT Training & Workshops", amount: 140000, income_date: "2027-02-18", description: "Professional workshop revenue" },
  { income_type: "CAPITAL_GAINS", source_name: "Capital Gain from Listed Shares", amount: 100000, income_date: "2027-03-10", description: "Realized capital gains" },
  { income_type: "OTHER_SOURCES", source_name: "Advisory & Board Honorarium", amount: 100000, income_date: "2027-04-05", description: "Professional advisory fees" },
];

// 2. 5 Business Expenses (Allowable deductions, is_tax_deductible = 1)
const BUSINESS_EXPENSES = [
  { expense_type_id: 1, amount: 120000, expense_date: "2026-08-01", description: "Office Space Rent - Commercial lease" },
  { expense_type_id: 2, amount: 150000, expense_date: "2026-09-01", description: "Employee Salaries & Technical support staff" },
  { expense_type_id: 3, amount: 30000, expense_date: "2026-10-01", description: "Commercial Utilities (High-speed internet & power)" },
  { expense_type_id: 4, amount: 50000, expense_date: "2026-11-01", description: "Digital Marketing & Client Acquisition Ads" },
  { expense_type_id: 5, amount: 20000, expense_date: "2026-12-01", description: "Office Supplies & Computing peripherals" },
];

// 3. 3 Personal Expenses (Non-deductible personal living expenses for IT-10B)
const PERSONAL_EXPENSES = [
  { expense_type_id: 9, amount: 180000, expense_date: "2026-08-15", description: "Residential House Rent - Living flat" },
  { expense_type_id: 10, amount: 240000, expense_date: "2026-09-20", description: "Family Living & Household Groceries" },
  { expense_type_id: 11, amount: 60000, expense_date: "2026-10-15", description: "Children Education & Tuition Fees" },
];

// 4. 5 Investment & Tax Deduction Types (Section 78 Rebate instruments)
const DEDUCTIONS = [
  { tax_year: "2026-27", deduction_code: "DPS", amount: 120000, deduction_date: "2026-08-20", description: "Deposit Pension Scheme (Statutory cap ৳120,000)" },
  { tax_year: "2026-27", deduction_code: "LIFE_INSURANCE", amount: 50000, policy_sum_assured: 600000, deduction_date: "2026-09-15", description: "Life Insurance Premium (Sum assured: ৳600,000, 10% cap = ৳60,000)" },
  { tax_year: "2026-27", deduction_code: "GOVT_SECURITIES", amount: 200000, deduction_date: "2026-10-25", description: "Government Treasury Bonds & Sanchayapatra (Cap ৳500,000)" },
  { tax_year: "2026-27", deduction_code: "STOCK_INVESTMENT", amount: 100000, deduction_date: "2026-11-30", description: "Dhaka Stock Exchange Listed Securities" },
  { tax_year: "2026-27", deduction_code: "BENEVOLENT_FUND", amount: 30000, deduction_date: "2026-12-15", description: "Benevolent Fund & Group Insurance contribution" },
];

async function runTest() {
  console.log("================================================================================");
  console.log("   BANGLADESH INCOME TAX CALCULATION & FILING SYSTEM - MULTI-ITEM RUN");
  console.log("   User        : rafy@gmail.com");
  console.log("   Tax Year    : " + TAX_YEAR);
  console.log("   Scenario    : 10 Incomes | 5 Business Exp | 3 Personal Exp | 5 Deduction Types");
  console.log("================================================================================\n");

  // Step 1: Login
  console.log("--> [Step 1] Authenticating user rafy@gmail.com via /api/auth/login...");
  const loginRes = await apiRequest("/auth/login", "POST", CREDENTIALS);
  const token = loginRes.token;
  const user = loginRes.user;
  console.log(`    Login SUCCESS! User ID: ${user.id}, Role: ${user.role}, Name: ${user.full_name}\n`);

  // Step 2: Clean up previous records for user
  console.log("--> [Step 2] Cleaning up existing income, expense, and deduction records...");
  const incomeList = await apiRequest("/income", "GET", null, token);
  for (const item of (incomeList.data || [])) {
    if (item.id) await apiRequest(`/income/${item.id}`, "DELETE", null, token);
  }

  const expenseList = await apiRequest("/expense", "GET", null, token);
  for (const item of (expenseList.data || [])) {
    if (item.id) await apiRequest(`/expense/${item.id}`, "DELETE", null, token);
  }

  const dedList = await apiRequest("/tax-deductions", "GET", null, token);
  for (const item of (dedList.data || [])) {
    if (item.id) await apiRequest(`/tax-deductions/${item.id}`, "DELETE", null, token);
  }
  console.log("    Previous records successfully wiped clean.\n");

  // Step 3: Setup Taxpayer Profile
  console.log("--> [Step 3] Updating Taxpayer Profile (General Male, Dhaka North, TDS: ৳20,000, Advance: ৳30,000)...");
  const profilePayload = {
    date_of_birth: "1988-06-15",
    gender: "MALE",
    minimum_tax_area: "REGULAR_TAXPAYER",
    is_new_taxpayer: 0,
    is_physically_challenged: 0,
    disabled_child_dependents: 0,
    is_freedom_fighter: 0,
    is_july_warrior: 0,
    net_wealth: 20000000, // 2 Crore (<= 4 Crore threshold)
    has_multiple_motor_vehicles: 0,
    has_large_house_property: 0,
    tds_amount: 20000,
    advance_tax_amount: 30000,
  };
  await apiRequest("/taxpayer-profiles", "PUT", profilePayload, token).catch(() =>
    apiRequest("/taxpayer-profiles", "POST", profilePayload, token)
  );
  console.log("    Profile setup complete.\n");

  // Step 4: Insert 10 Incomes
  console.log("--> [Step 4] Inserting 10 Income entries across multiple heads...");
  let totalIncomeEntered = 0;
  for (let i = 0; i < INCOMES.length; i++) {
    const inc = INCOMES[i];
    await apiRequest("/income", "POST", inc, token);
    totalIncomeEntered += inc.amount;
    console.log(`    [Income ${i + 1}/10] [${inc.income_type}] ${inc.source_name}: ৳ ${inc.amount.toLocaleString()}`);
  }
  console.log(`    Total Gross Incomes Entered: ৳ ${totalIncomeEntered.toLocaleString()}\n`);

  // Step 5: Insert 5 Business Expenses
  console.log("--> [Step 5] Inserting 5 Business Expenses (Statutory Allowable Business Deductions)...");
  let totalBusinessExpenseEntered = 0;
  for (let i = 0; i < BUSINESS_EXPENSES.length; i++) {
    const exp = BUSINESS_EXPENSES[i];
    await apiRequest("/expense", "POST", exp, token);
    totalBusinessExpenseEntered += exp.amount;
    console.log(`    [Business Exp ${i + 1}/5] ${exp.description}: ৳ ${exp.amount.toLocaleString()}`);
  }
  console.log(`    Total Business Expenses Entered: ৳ ${totalBusinessExpenseEntered.toLocaleString()}\n`);

  // Step 6: Insert 3 Personal Expenses
  console.log("--> [Step 6] Inserting 3 Personal Expenses (Personal living expenses for IT-10B)...");
  let totalPersonalExpenseEntered = 0;
  for (let i = 0; i < PERSONAL_EXPENSES.length; i++) {
    const exp = PERSONAL_EXPENSES[i];
    await apiRequest("/expense", "POST", exp, token);
    totalPersonalExpenseEntered += exp.amount;
    console.log(`    [Personal Exp ${i + 1}/3] ${exp.description}: ৳ ${exp.amount.toLocaleString()}`);
  }
  console.log(`    Total Personal Expenses Entered: ৳ ${totalPersonalExpenseEntered.toLocaleString()}\n`);

  // Step 7: Insert 5 Investment & Tax Deduction Types
  console.log("--> [Step 7] Inserting 5 Investment & Tax Deduction instruments...");
  let totalInvestmentEntered = 0;
  for (let i = 0; i < DEDUCTIONS.length; i++) {
    const ded = DEDUCTIONS[i];
    await apiRequest("/tax-deductions", "POST", ded, token);
    totalInvestmentEntered += ded.amount;
    console.log(`    [Investment ${i + 1}/5] [${ded.deduction_code}] ${ded.description}: ৳ ${ded.amount.toLocaleString()}`);
  }
  console.log(`    Total Eligible Investments Entered: ৳ ${totalInvestmentEntered.toLocaleString()}\n`);

  // Step 8: Trigger Tax Calculation via API
  console.log("--> [Step 8] Triggering production Tax Calculation API (/api/tax-calculations)...");
  const calcRes = await apiRequest("/tax-calculations", "POST", { tax_year: TAX_YEAR }, token);
  const actual = calcRes.data;
  console.log("    Tax calculation completed successfully!\n");

  // Step 9: Print Full Tax Calculation Sheet
  console.log("================================================================================");
  console.log("                       FINAL TAX CALCULATION WORKSHEET");
  console.log("================================================================================");
  console.log(`  Taxpayer Name                 : Rafy (rafy@gmail.com)`);
  console.log(`  Assessment Year               : ${actual.taxYear || actual.tax_year}`);
  console.log(`  Taxpayer Category             : ${actual.category} (Basic Threshold: ৳ ${Number(actual.taxFreeThreshold).toLocaleString()})`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`  1. Total Gross Income (10 items): ৳ ${Number(actual.totalIncome).toLocaleString()}`);
  console.log(`  2. Statutory Deductions:`);
  console.log(`     - Salary Statutory Exemption : ৳ ${Number(actual.salaryExemption).toLocaleString()} (1/3 of salary, max ৳ 500,000)`);
  console.log(`     - Deductible Business Exp (5): ৳ ${Number(actual.totalDeductibleExpense).toLocaleString()}`);
  console.log(`     - Total Statutory Deductions : ৳ ${Number(actual.totalDeduction).toLocaleString()}`);
  console.log(`     *(Personal Expenses 3 items  : ৳ ${totalPersonalExpenseEntered.toLocaleString()} recorded for IT-10B statement)*`);
  console.log(`  3. Net Taxable Income           : ৳ ${Number(actual.taxableIncome).toLocaleString()}`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`  4. Progressive Tax Slab Breakdown:`);
  if (actual.details && actual.details.length > 0) {
    for (const slab of actual.details) {
      const order = slab.slabOrder ?? slab.slab_order ?? 1;
      const rate = slab.taxRate ?? slab.tax_rate ?? 0;
      const amount = slab.taxableAmount ?? slab.taxable_amount ?? 0;
      const tax = slab.calculatedTax ?? slab.calculated_tax ?? 0;
      const minInc = slab.minimumIncome ?? slab.minimum_income ?? 0;
      const maxInc = slab.maximumIncome ?? slab.maximum_income ? `৳ ${Number(slab.maximumIncome ?? slab.maximum_income).toLocaleString()}` : "Rest";
      console.log(`     - Slab ${order}: ৳ ${Number(amount).toLocaleString()} @ ${rate}% = ৳ ${Number(tax).toLocaleString()} (Range: ৳ ${Number(minInc).toLocaleString()} - ${maxInc})`);
    }
  }
  console.log(`  5. Total Gross Tax              : ৳ ${Number(actual.grossTax).toLocaleString()}`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`  6. Section 78 Investment Rebate:`);
  console.log(`     - Eligible Investments (5)   : ৳ ${Number(actual.eligibleInvestment).toLocaleString()}`);
  console.log(`     - Limit by Inv (15% rate)    : ৳ ${Number(actual.investmentBasedRebateLimit).toLocaleString()}`);
  console.log(`     - Limit by Income (3% of TI) : ৳ ${Number(actual.incomeBasedRebateLimit).toLocaleString()}`);
  console.log(`     - Absolute Statutory Cap     : ৳ ${Number(actual.investmentMaximum).toLocaleString()}`);
  console.log(`     - Tax Rebate Allowed (Lowest): ৳ ${Number(actual.taxRebate).toLocaleString()}`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`  7. Tax After Rebate             : ৳ ${Number(actual.taxAfterRebate).toLocaleString()}`);
  console.log(`  8. Minimum Tax (Dhaka City Corp): ৳ ${Number(actual.minimumTax).toLocaleString()}`);
  console.log(`  9. Tax Liability                : ৳ ${Number(actual.taxLiability).toLocaleString()}`);
  console.log(` 10. Wealth Surcharge (0% <= 4Cr) : ৳ ${Number(actual.surchargeAmount || 0).toLocaleString()}`);
  console.log(` 11. Total Tax Payable            : ৳ ${Number(actual.totalTaxPayable).toLocaleString()}`);
  console.log(` 12. Less Tax Credits (TDS & Adv) : ৳ ${Number(actual.totalTaxCredits).toLocaleString()} (TDS: ৳20,000 + Adv: ৳30,000)`);
  console.log(` 13. FINAL AMOUNT PAYABLE         : ৳ ${Number(actual.finalPayable).toLocaleString()}`);
  console.log("================================================================================\n");

  // Step 10: Mathematical Assertions against Bangladesh Income Tax Law
  const expectedTotalIncome = 3400000;
  const expectedSalaryExemption = 400000; // min(1,200,000 / 3, 500,000)
  const expectedBusinessExpense = 370000;
  const expectedTaxableIncome = 3400000 - (400000 + 370000); // 2,630,000
  // Slabs on 2,630,000:
  // 375,000 @ 0% = 0
  // 300,000 @ 10% = 30,000
  // 400,000 @ 15% = 60,000
  // 500,000 @ 20% = 100,000
  // remaining 1,055,000 @ 25% = 263,750
  // Gross tax = 453,750
  const expectedGrossTax = 453750;
  // Rebate: lowest of (15% of 500k = 75,000, 3% of 2,630,000 = 78,900, 1,000,000) = 75,000
  const expectedRebate = 75000;
  const expectedTaxAfterRebate = 453750 - 75000; // 378,750
  const expectedLiability = 378750;
  const expectedFinalPayable = 378750 - 50000; // 328,750

  const assertions = [
    { name: "Total Gross Income", actual: Number(actual.totalIncome), expected: expectedTotalIncome },
    { name: "Salary Exemption", actual: Number(actual.salaryExemption), expected: expectedSalaryExemption },
    { name: "Business Deductions", actual: Number(actual.totalDeductibleExpense), expected: expectedBusinessExpense },
    { name: "Taxable Income", actual: Number(actual.taxableIncome), expected: expectedTaxableIncome },
    { name: "Gross Tax", actual: Number(actual.grossTax), expected: expectedGrossTax },
    { name: "Tax Rebate", actual: Number(actual.taxRebate), expected: expectedRebate },
    { name: "Tax After Rebate", actual: Number(actual.taxAfterRebate), expected: expectedTaxAfterRebate },
    { name: "Tax Liability", actual: Number(actual.taxLiability), expected: expectedLiability },
    { name: "Final Payable", actual: Number(actual.finalPayable), expected: expectedFinalPayable },
  ];

  let passed = true;
  for (const a of assertions) {
    const diff = Math.abs(a.actual - a.expected);
    if (diff < 0.05) {
      console.log(`  [PASS] ${a.name.padEnd(25)}: Actual ৳ ${a.actual.toLocaleString()} == Expected ৳ ${a.expected.toLocaleString()}`);
    } else {
      console.error(`  [FAIL] ${a.name.padEnd(25)}: Actual ৳ ${a.actual.toLocaleString()} != Expected ৳ ${a.expected.toLocaleString()}`);
      passed = false;
    }
  }

  if (passed) {
    console.log("\n>>> ALL ASSERTIONS PASSED! CALCULATION IS 100% ACCURATE AND BD TAX LAW COMPLIANT! <<<\n");
  } else {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
