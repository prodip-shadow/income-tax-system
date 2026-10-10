/**
 * Complete End-to-End Live Verification Test for User: rafy@gmail.com
 * Uses native fetch to authenticate, set up taxpayer profiles across all 7 official NBR demographic categories,
 * plus statutory allowance cases (Disabled Child, New Taxpayer Concession, High Wealth Surcharge),
 * inserts live income & investment data, runs production tax calculation endpoint,
 * and asserts against authoritative Bangladesh Income Tax Rules.
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

const CATEGORY_CASES = [
  {
    name: "1. GENERAL (General Individual Taxpayer)",
    category: "GENERAL",
    profile: {
      date_of_birth: "1985-05-15",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 25000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 5000,
      advance_tax_amount: 10000,
    },
    incomes: [
      {
        income_type: "SALARY",
        source_name: "Tech Corp BD",
        amount: 1200000,
        income_date: "2026-08-15",
        description: "Annual Salary",
      },
    ],
    deductions: [
      {
        tax_year: "2026-27",
        deduction_code: "DPS",
        amount: 100000,
        deduction_date: "2026-10-10",
        description: "Deposit Pension Scheme",
      },
    ],
    expected: {
      category: "GENERAL",
      baseThreshold: 375000,
      totalIncome: 1200000,
      salaryExemption: 400000, // min(1,200,000 / 3, 500,000)
      taxableIncome: 800000,  // 1,200,000 - 400,000
      // Slabs on 800,000:
      // 0 - 375,000 @ 0% = 0
      // 300,000 @ 10% = 30,000
      // Remaining 125,000 @ 15% = 18,750
      grossTax: 48750,
      // Rebate (Sec 78): min(3% of 800k = 24,000, 15% of 100k = 15,000, 1,000,000) = 15,000
      rebate: 15000,
      taxAfterRebate: 33750,
      minimumTax: 5000,
      taxLiability: 33750,
      surcharge: 0,
      totalPayable: 33750,
      credits: 15000, // 5,000 TDS + 10,000 Advance
      finalPayable: 18750,
    },
  },
  {
    name: "2. WOMEN (Female Individual Taxpayer)",
    category: "WOMEN",
    profile: {
      date_of_birth: "1990-08-20",
      gender: "FEMALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 15000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "BUSINESS",
        source_name: "Consulting Business",
        amount: 800000,
        income_date: "2026-09-01",
        description: "Consultancy Income",
      },
    ],
    deductions: [],
    expected: {
      category: "WOMEN",
      baseThreshold: 425000,
      totalIncome: 800000,
      salaryExemption: 0,
      taxableIncome: 800000,
      // Slabs on 800,000:
      // 0 - 425,000 @ 0% = 0
      // 300,000 @ 10% = 30,000
      // Remaining 75,000 @ 15% = 11,250
      grossTax: 41250,
      rebate: 0,
      taxAfterRebate: 41250,
      minimumTax: 5000,
      taxLiability: 41250,
      surcharge: 0,
      totalPayable: 41250,
      credits: 0,
      finalPayable: 41250,
    },
  },
  {
    name: "3. SENIOR_CITIZEN (Aged 65+ Years Taxpayer)",
    category: "SENIOR_CITIZEN",
    profile: {
      date_of_birth: "1955-01-10", // Age 72 at 30 June 2027
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 20000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "RENT",
        source_name: "House Property Rent",
        amount: 1000000,
        income_date: "2026-11-01",
        description: "Rental Income",
      },
    ],
    deductions: [],
    expected: {
      category: "SENIOR_CITIZEN",
      baseThreshold: 425000,
      totalIncome: 1000000,
      salaryExemption: 0,
      taxableIncome: 1000000,
      // Slabs on 1,000,000:
      // 0 - 425,000 @ 0% = 0
      // 300,000 @ 10% = 30,000
      // Remaining 275,000 @ 15% = 41,250
      grossTax: 71250,
      rebate: 0,
      taxAfterRebate: 71250,
      minimumTax: 5000,
      taxLiability: 71250,
      surcharge: 0,
      totalPayable: 71250,
      credits: 0,
      finalPayable: 71250,
    },
  },
  {
    name: "4. PHYSICALLY_CHALLENGED (Disabled Individual Taxpayer)",
    category: "PHYSICALLY_CHALLENGED",
    profile: {
      date_of_birth: "1988-04-12",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 1,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 10000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "BUSINESS",
        source_name: "IT Services",
        amount: 900000,
        income_date: "2026-07-20",
        description: "Software Services",
      },
    ],
    deductions: [],
    expected: {
      category: "PHYSICALLY_CHALLENGED",
      baseThreshold: 500000,
      totalIncome: 900000,
      salaryExemption: 0,
      taxableIncome: 900000,
      // Slabs on 900,000:
      // 0 - 500,000 @ 0% = 0
      // 300,000 @ 10% = 30,000
      // Remaining 100,000 @ 15% = 15,000
      grossTax: 45000,
      rebate: 0,
      taxAfterRebate: 45000,
      minimumTax: 5000,
      taxLiability: 45000,
      surcharge: 0,
      totalPayable: 45000,
      credits: 0,
      finalPayable: 45000,
    },
  },
  {
    name: "5. THIRD_GENDER (Third Gender Taxpayer)",
    category: "THIRD_GENDER",
    profile: {
      date_of_birth: "1994-06-25",
      gender: "THIRD_GENDER",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 5000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "BUSINESS",
        source_name: "Handicrafts Enterprise",
        amount: 900000,
        income_date: "2026-08-20",
        description: "Sales Revenue",
      },
    ],
    deductions: [],
    expected: {
      category: "THIRD_GENDER",
      baseThreshold: 500000,
      totalIncome: 900000,
      salaryExemption: 0,
      taxableIncome: 900000,
      // Slabs on 900,000:
      // 0 - 500,000 @ 0% = 0
      // 300,000 @ 10% = 30,000
      // Remaining 100,000 @ 15% = 15,000
      grossTax: 45000,
      rebate: 0,
      taxAfterRebate: 45000,
      minimumTax: 5000,
      taxLiability: 45000,
      surcharge: 0,
      totalPayable: 45000,
      credits: 0,
      finalPayable: 45000,
    },
  },
  {
    name: "6. WAR_WOUNDED_FREEDOM_FIGHTER (Gazetted Freedom Fighter)",
    category: "WAR_WOUNDED_FREEDOM_FIGHTER",
    profile: {
      date_of_birth: "1950-03-26",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 1,
      is_july_warrior: 0,
      net_wealth: 30000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "BUSINESS",
        source_name: "Honorarium & Business",
        amount: 1000000,
        income_date: "2026-10-15",
        description: "Business Receipts",
      },
    ],
    deductions: [],
    expected: {
      category: "WAR_WOUNDED_FREEDOM_FIGHTER",
      baseThreshold: 525000,
      totalIncome: 1000000,
      salaryExemption: 0,
      taxableIncome: 1000000,
      // Slabs on 1,000,000:
      // 0 - 525,000 @ 0% = 0
      // 300,000 @ 10% = 30,000
      // Remaining 175,000 @ 15% = 26,250
      grossTax: 56250,
      rebate: 0,
      taxAfterRebate: 56250,
      minimumTax: 5000,
      taxLiability: 56250,
      surcharge: 0,
      totalPayable: 56250,
      credits: 0,
      finalPayable: 56250,
    },
  },
  {
    name: "7. JULY_WARRIOR (July 2024 Mass-Uprising Participant)",
    category: "JULY_WARRIOR",
    profile: {
      date_of_birth: "2001-07-15",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 1,
      net_wealth: 5000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "BUSINESS",
        source_name: "Freelance & Consulting",
        amount: 1000000,
        income_date: "2026-09-10",
        description: "Freelance Revenue",
      },
    ],
    deductions: [],
    expected: {
      category: "JULY_WARRIOR",
      baseThreshold: 525000,
      totalIncome: 1000000,
      salaryExemption: 0,
      taxableIncome: 1000000,
      // Slabs on 1,000,000:
      // 0 - 525,000 @ 0% = 0
      // 300,000 @ 10% = 30,000
      // Remaining 175,000 @ 15% = 26,250
      grossTax: 56250,
      rebate: 0,
      taxAfterRebate: 56250,
      minimumTax: 5000,
      taxLiability: 56250,
      surcharge: 0,
      totalPayable: 56250,
      credits: 0,
      finalPayable: 56250,
    },
  },
  {
    name: "8. DISABLED_CHILD_BENEFIT (General + 2 Disabled Dependents = +৳100,000)",
    category: "GENERAL",
    profile: {
      date_of_birth: "1982-11-20",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 2, // 2 * 50,000 = +100,000
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 10000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "BUSINESS",
        source_name: "Retail Shop",
        amount: 800000,
        income_date: "2026-10-01",
        description: "Retail Income",
      },
    ],
    deductions: [],
    expected: {
      category: "GENERAL",
      baseThreshold: 475000, // 375,000 + 100,000
      totalIncome: 800000,
      salaryExemption: 0,
      taxableIncome: 800000,
      // Slabs on 800,000:
      // 0 - 475,000 @ 0% = 0
      // Remaining 325,000:
      // 300,000 @ 10% = 30,000
      // Remaining 25,000 @ 15% = 3,750
      grossTax: 33750,
      rebate: 0,
      taxAfterRebate: 33750,
      minimumTax: 5000,
      taxLiability: 33750,
      surcharge: 0,
      totalPayable: 33750,
      credits: 0,
      finalPayable: 33750,
    },
  },
  {
    name: "9. NEW_TAXPAYER_CONCESSION (First-Time Filer = ৳1,000 Minimum Tax)",
    category: "GENERAL",
    profile: {
      date_of_birth: "1998-02-14",
      gender: "MALE",
      minimum_tax_area: "NEW_TAXPAYER",
      is_new_taxpayer: 1, // Concession flag
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 2000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "BUSINESS",
        source_name: "Small Business",
        amount: 380000, // Just 5,000 above 375k
        income_date: "2026-08-01",
        description: "Business Income",
      },
    ],
    deductions: [],
    expected: {
      category: "GENERAL",
      baseThreshold: 375000,
      totalIncome: 380000,
      salaryExemption: 0,
      taxableIncome: 380000,
      // Slabs on 380,000:
      // 0 - 375,000 @ 0% = 0
      // Remaining 5,000 @ 10% = 500
      grossTax: 500,
      rebate: 0,
      taxAfterRebate: 500,
      minimumTax: 1000, // Reduced from 5,000 to 1,000 under Section 1.3
      taxLiability: 1000, // Minimum tax applied because 500 < 1,000
      surcharge: 0,
      totalPayable: 1000,
      credits: 0,
      finalPayable: 1000,
    },
  },
  {
    name: "10. HIGH_NET_WEALTH_SURCHARGE (Net Wealth ৳6 Crore -> 10% Wealth Surcharge)",
    category: "GENERAL",
    profile: {
      date_of_birth: "1980-01-01",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 60000000, // 6 Crore BDT (> 4 Crore threshold)
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 0,
      advance_tax_amount: 0,
    },
    incomes: [
      {
        income_type: "BUSINESS",
        source_name: "Manufacturing Business",
        amount: 1000000,
        income_date: "2026-09-01",
        description: "Business Income",
      },
    ],
    deductions: [],
    expected: {
      category: "GENERAL",
      baseThreshold: 375000,
      totalIncome: 1000000,
      salaryExemption: 0,
      taxableIncome: 1000000,
      // Slabs on 1,000,000:
      // 0 - 375,000 @ 0% = 0
      // 300,000 @ 10% = 30,000
      // Remaining 325,000 @ 15% = 48,750
      grossTax: 78750,
      rebate: 0,
      taxAfterRebate: 78750,
      minimumTax: 5000,
      taxLiability: 78750,
      surcharge: 7875, // 10% on tax liability 78,750
      totalPayable: 86625,
      credits: 0,
      finalPayable: 86625,
    },
  },
];

async function runLiveTest() {
  console.log("================================================================================");
  console.log("   BANGLADESH INCOME TAX CALCULATION & FILING SYSTEM - LIVE USER TEST");
  console.log("   Target User : rafy@gmail.com");
  console.log("   Tax Year    : " + TAX_YEAR);
  console.log("================================================================================\n");

  // Step 1: Login
  console.log("--> [Step 1] Authenticating user rafy@gmail.com via /api/auth/login...");
  let token;
  let user;
  try {
    const loginRes = await apiRequest("/auth/login", "POST", CREDENTIALS);
    if (!loginRes.success || !loginRes.token) {
      throw new Error("Login failed: " + JSON.stringify(loginRes));
    }
    token = loginRes.token;
    user = loginRes.user;
    console.log(`    Login SUCCESS! Token acquired. User ID: ${user.id}, Role: ${user.role}, Name: ${user.full_name}\n`);
  } catch (err) {
    console.error("FATAL: Login failed:", err.data || err.message);
    process.exit(1);
  }

  let totalTests = CATEGORY_CASES.length;
  let passedTests = 0;

  for (let i = 0; i < CATEGORY_CASES.length; i++) {
    const tc = CATEGORY_CASES[i];
    console.log("--------------------------------------------------------------------------------");
    console.log(`TEST [${i + 1}/${totalTests}]: ${tc.name}`);
    console.log("--------------------------------------------------------------------------------");

    // Clean up existing income & deductions
    const incomeListRes = await apiRequest("/income", "GET", null, token);
    const incomes = incomeListRes.data || incomeListRes || [];
    for (const inc of incomes) {
      if (inc.id) {
        await apiRequest(`/income/${inc.id}`, "DELETE", null, token);
      }
    }

    const dedListRes = await apiRequest("/tax-deductions", "GET", null, token);
    const deds = dedListRes.data || dedListRes || [];
    for (const d of deds) {
      if (d.id) {
        await apiRequest(`/tax-deductions/${d.id}`, "DELETE", null, token);
      }
    }

    const expListRes = await apiRequest("/expense", "GET", null, token);
    const exps = expListRes.data || expListRes || [];
    for (const e of exps) {
      if (e.id) {
        await apiRequest(`/expense/${e.id}`, "DELETE", null, token);
      }
    }

    // Upsert profile
    let profileExists = false;
    try {
      const getProfileRes = await apiRequest("/taxpayer-profiles", "GET", null, token);
      if (getProfileRes.data) profileExists = true;
    } catch {
      profileExists = false;
    }

    if (profileExists) {
      await apiRequest("/taxpayer-profiles", "PUT", tc.profile, token);
    } else {
      await apiRequest("/taxpayer-profiles", "POST", tc.profile, token);
    }

    // Insert incomes
    for (const inc of tc.incomes) {
      await apiRequest("/income", "POST", inc, token);
    }

    // Insert deductions
    for (const d of tc.deductions) {
      await apiRequest("/tax-deductions", "POST", d, token);
    }

    // Trigger tax calculation via API
    const calcRes = await apiRequest(
      "/tax-calculations",
      "POST",
      { tax_year: TAX_YEAR },
      token
    );

    const actual = calcRes.data;
    const exp = tc.expected;

    // Output verification table
    console.log(`  Taxpayer Category     : ${actual.category} (Expected: ${exp.category})`);
    console.log(`  Tax-Free Threshold    : ৳ ${Number(actual.taxFreeThreshold).toLocaleString()} (Expected: ৳ ${exp.baseThreshold.toLocaleString()})`);
    console.log(`  Total Income          : ৳ ${Number(actual.totalIncome).toLocaleString()} (Expected: ৳ ${exp.totalIncome.toLocaleString()})`);
    console.log(`  Salary Exemption      : ৳ ${Number(actual.salaryExemption || 0).toLocaleString()} (Expected: ৳ ${exp.salaryExemption.toLocaleString()})`);
    console.log(`  Taxable Income        : ৳ ${Number(actual.taxableIncome).toLocaleString()} (Expected: ৳ ${exp.taxableIncome.toLocaleString()})`);
    console.log(`  Gross Tax             : ৳ ${Number(actual.grossTax).toLocaleString()} (Expected: ৳ ${exp.grossTax.toLocaleString()})`);
    console.log(`  Tax Rebate            : ৳ ${Number(actual.taxRebate || 0).toLocaleString()} (Expected: ৳ ${exp.rebate.toLocaleString()})`);
    console.log(`  Tax After Rebate      : ৳ ${Number(actual.taxAfterRebate).toLocaleString()} (Expected: ৳ ${exp.taxAfterRebate.toLocaleString()})`);
    console.log(`  Minimum Tax Amount    : ৳ ${Number(actual.minimumTax).toLocaleString()} (Expected: ৳ ${exp.minimumTax.toLocaleString()})`);
    console.log(`  Tax Liability         : ৳ ${Number(actual.taxLiability).toLocaleString()} (Expected: ৳ ${exp.taxLiability.toLocaleString()})`);
    console.log(`  Wealth Surcharge      : ৳ ${Number(actual.surchargeAmount || 0).toLocaleString()} (Expected: ৳ ${exp.surcharge.toLocaleString()})`);
    console.log(`  Total Tax Payable     : ৳ ${Number(actual.totalTaxPayable).toLocaleString()} (Expected: ৳ ${exp.totalPayable.toLocaleString()})`);
    console.log(`  Tax Credits (TDS/Adv) : ৳ ${Number(actual.totalTaxCredits || 0).toLocaleString()} (Expected: ৳ ${exp.credits.toLocaleString()})`);
    console.log(`  Final Amount Payable  : ৳ ${Number(actual.finalPayable).toLocaleString()} (Expected: ৳ ${exp.finalPayable.toLocaleString()})`);

    // Assertions
    const diffThreshold = Math.abs(Number(actual.taxFreeThreshold) - exp.baseThreshold);
    const diffTaxable = Math.abs(Number(actual.taxableIncome) - exp.taxableIncome);
    const diffGross = Math.abs(Number(actual.grossTax) - exp.grossTax);
    const diffRebate = Math.abs(Number(actual.taxRebate || 0) - exp.rebate);
    const diffLiability = Math.abs(Number(actual.taxLiability) - exp.taxLiability);
    const diffSurcharge = Math.abs(Number(actual.surchargeAmount || 0) - exp.surcharge);
    const diffFinal = Math.abs(Number(actual.finalPayable) - exp.finalPayable);

    const isPass =
      actual.category === exp.category &&
      diffThreshold < 0.05 &&
      diffTaxable < 0.05 &&
      diffGross < 0.05 &&
      diffRebate < 0.05 &&
      diffLiability < 0.05 &&
      diffSurcharge < 0.05 &&
      diffFinal < 0.05;

    if (isPass) {
      console.log(`  STATUS                : >>> PASS (100% compliant with NBR Paripatra 2025-26 / 2026-27 & Income Tax Act 2023) <<<\n`);
      passedTests++;
    } else {
      console.error(`  STATUS                : >>> FAIL <<<\n`);
    }
  }

  console.log("================================================================================");
  console.log(`   EXECUTION SUMMARY FOR USER: rafy@gmail.com`);
  console.log(`   TOTAL TESTS : ${totalTests}`);
  console.log(`   PASSED      : ${passedTests}`);
  console.log(`   FAILED      : ${totalTests - passedTests}`);
  console.log("================================================================================");

  // Restore User's full multi-item dataset (10 incomes, 8 expenses, 5 investments)
  console.log("\n--> [Post-Test Cleanup] Restoring User rafy@gmail.com complete multi-item records...");
  const incList = await apiRequest("/income", "GET", null, token);
  for (const inc of (incList.data || [])) {
    if (inc.id) await apiRequest(`/income/${inc.id}`, "DELETE", null, token);
  }
  const expList = await apiRequest("/expense", "GET", null, token);
  for (const exp of (expList.data || [])) {
    if (exp.id) await apiRequest(`/expense/${exp.id}`, "DELETE", null, token);
  }
  const dedList = await apiRequest("/tax-deductions", "GET", null, token);
  for (const ded of (dedList.data || [])) {
    if (ded.id) await apiRequest(`/tax-deductions/${ded.id}`, "DELETE", null, token);
  }

  // Restore 10 Incomes
  const RESTORE_INCOMES = [
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
  for (const inc of RESTORE_INCOMES) {
    await apiRequest("/income", "POST", inc, token);
  }

  // Restore 5 Business + 3 Personal Expenses
  const RESTORE_EXPENSES = [
    { expense_type_id: 1, amount: 120000, expense_date: "2026-08-01", description: "Office Space Rent - Commercial lease" },
    { expense_type_id: 2, amount: 150000, expense_date: "2026-09-01", description: "Employee Salaries & Technical support staff" },
    { expense_type_id: 3, amount: 30000, expense_date: "2026-10-01", description: "Commercial Utilities (High-speed internet & power)" },
    { expense_type_id: 4, amount: 50000, expense_date: "2026-11-01", description: "Digital Marketing & Client Acquisition Ads" },
    { expense_type_id: 5, amount: 20000, expense_date: "2026-12-01", description: "Office Supplies & Computing peripherals" },
    { expense_type_id: 9, amount: 180000, expense_date: "2026-08-15", description: "Residential House Rent - Living flat" },
    { expense_type_id: 10, amount: 240000, expense_date: "2026-09-20", description: "Family Living & Household Groceries" },
    { expense_type_id: 11, amount: 60000, expense_date: "2026-10-15", description: "Children Education & Tuition Fees" },
  ];
  for (const exp of RESTORE_EXPENSES) {
    await apiRequest("/expense", "POST", exp, token);
  }

  // Restore 5 Deductions
  const RESTORE_DEDUCTIONS = [
    { tax_year: "2026-27", deduction_code: "DPS", amount: 120000, deduction_date: "2026-08-20", description: "Deposit Pension Scheme (Statutory cap ৳120,000)" },
    { tax_year: "2026-27", deduction_code: "LIFE_INSURANCE", amount: 50000, policy_sum_assured: 600000, deduction_date: "2026-09-15", description: "Life Insurance Premium (Sum assured: ৳600,000, 10% cap = ৳60,000)" },
    { tax_year: "2026-27", deduction_code: "GOVT_SECURITIES", amount: 200000, deduction_date: "2026-10-25", description: "Government Treasury Bonds & Sanchayapatra (Cap ৳500,000)" },
    { tax_year: "2026-27", deduction_code: "STOCK_INVESTMENT", amount: 100000, deduction_date: "2026-11-30", description: "Dhaka Stock Exchange Listed Securities" },
    { tax_year: "2026-27", deduction_code: "BENEVOLENT_FUND", amount: 30000, deduction_date: "2026-12-15", description: "Benevolent Fund & Group Insurance contribution" },
  ];
  for (const ded of RESTORE_DEDUCTIONS) {
    await apiRequest("/tax-deductions", "POST", ded, token);
  }

  // Restore standard General Male Profile
  const profilePayload = {
    date_of_birth: "1988-06-15",
    gender: "MALE",
    minimum_tax_area: "REGULAR_TAXPAYER",
    is_new_taxpayer: 0,
    is_physically_challenged: 0,
    disabled_child_dependents: 0,
    is_freedom_fighter: 0,
    is_july_warrior: 0,
    net_wealth: 20000000,
    has_multiple_motor_vehicles: 0,
    has_large_house_property: 0,
    tds_amount: 20000,
    advance_tax_amount: 30000,
  };
  await apiRequest("/taxpayer-profiles", "PUT", profilePayload, token).catch(() =>
    apiRequest("/taxpayer-profiles", "POST", profilePayload, token)
  );

  // Recalculate
  await apiRequest("/tax-calculations", "POST", { tax_year: TAX_YEAR }, token);
  console.log("--> [Post-Test Cleanup] Successfully restored 10 Incomes, 8 Expenses, and 5 Investments!\n");

  if (passedTests === totalTests) {
    console.log("   ALL CATEGORIES VERIFIED ACCURATELY AGAINST BANGLADESH NBR TAX RULES!");
  } else {
    process.exit(1);
  }
}

runLiveTest().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
