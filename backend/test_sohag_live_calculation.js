/**
 * Live End-to-End Verification Test for User: sohag@gmail.com
 * Password: sohag@123
 *
 * 1. Authenticates via live HTTP API /api/auth/login
 * 2. Seeds:
 *    - 15 Incomes (Salary, Business, Rent, Agriculture, Financial Assets, Capital Gains, Other Sources)
 *    - 8 Business Expenses (Office rent, Salaries, Utilities, Marketing, Supplies, Travel, Consultancy, Maintenance)
 *    - 5 Personal Expenses (Home rent, Family living, Education, Healthcare, Home utilities)
 *    - 6 Investments (DPS, Life Insurance, Govt Securities, Stock Investment, Benevolent Fund, Zakat)
 * 3. Executes live tax calculation across ALL 7 official demographic categories and statutory cases:
 *    - GENERAL
 *    - WOMEN
 *    - SENIOR_CITIZEN
 *    - PHYSICALLY_CHALLENGED
 *    - THIRD_GENDER
 *    - WAR_WOUNDED_FREEDOM_FIGHTER
 *    - JULY_WARRIOR
 *    - DISABLED_CHILD_BENEFIT
 *    - NEW_TAXPAYER_CONCESSION
 *    - HIGH_NET_WEALTH_SURCHARGE
 * 4. Compares live API outputs against Bangladesh NBR Income Tax Act 2023 & NBR Paripatra rules.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const BASE_URL = "http://localhost:5000/api";
const CREDENTIALS = {
  email: "sohag@gmail.com",
  password: "sohag@123",
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

// 15 Income Records
const SOHAG_INCOMES = [
  { income_type: "SALARY", source_name: "Apex Tech Ltd - Basic Salary", amount: 720000, income_date: "2026-07-15", description: "Monthly Basic Salary" },
  { income_type: "SALARY", source_name: "Apex Tech Ltd - House Rent Allowance", amount: 240000, income_date: "2026-08-15", description: "House Rent Allowance" },
  { income_type: "SALARY", source_name: "Apex Tech Ltd - Medical Allowance", amount: 60000, income_date: "2026-09-15", description: "Medical Allowance" },
  { income_type: "SALARY", source_name: "Apex Tech Ltd - Festival Bonus", amount: 120000, income_date: "2026-10-15", description: "Two Festival Bonuses" },
  { income_type: "BUSINESS", source_name: "Software Consultancy Solutions", amount: 350000, income_date: "2026-11-10", description: "Enterprise Software Consulting Fees" },
  { income_type: "BUSINESS", source_name: "Digital Commerce Retail Sales", amount: 250000, income_date: "2026-12-05", description: "Online E-Commerce Platform Net Revenue" },
  { income_type: "BUSINESS", source_name: "IT Systems Maintenance Contract", amount: 150000, income_date: "2027-01-12", description: "Annual IT Support Contract" },
  { income_type: "HOUSE_RENT", source_name: "Dhanmondi Residential Apartment", amount: 300000, income_date: "2027-02-01", description: "Residential Property Rental Income" },
  { income_type: "HOUSE_RENT", source_name: "Chittagong GEC Commercial Space", amount: 180000, income_date: "2027-02-20", description: "Commercial Shop Rental Income" },
  { income_type: "AGRICULTURE", source_name: "Agro Farm Crop & Fruit Harvest", amount: 120000, income_date: "2027-03-05", description: "Agricultural Produce Sales" },
  { income_type: "FINANCIAL_ASSETS", source_name: "City Bank FDR Interest", amount: 80000, income_date: "2027-03-25", description: "Bank Fixed Deposit Gross Interest" },
  { income_type: "FINANCIAL_ASSETS", source_name: "National Savings Bureau Profit", amount: 70000, income_date: "2027-04-10", description: "5-Year Sanchayapatra Profit Receipts" },
  { income_type: "CAPITAL_GAINS", source_name: "Capital Gain from Listed Shares", amount: 100000, income_date: "2027-04-28", description: "Capital Gain from Stock Market Realization" },
  { income_type: "OTHER_SOURCES", source_name: "Technical Advisory & Seminars", amount: 50000, income_date: "2027-05-15", description: "Guest Lecture & Seminar Honorarium" },
  { income_type: "OTHER_SOURCES", source_name: "Technical Book Authorship Royalties", amount: 30000, income_date: "2027-06-01", description: "Annual Publication Royalties" },
];

// 8 Business Expenses (All is_tax_deductible = 1)
const SOHAG_BUSINESS_EXPENSES = [
  { expense_type_id: 1, expense_type: "Commercial Office Rent", expense_category: "BUSINESS", is_tax_deductible: 1, amount: 80000, expense_date: "2026-08-10", description: "Monthly commercial workspace rent" },
  { expense_type_id: 2, expense_type: "Employee Salaries & Wages", expense_category: "BUSINESS", is_tax_deductible: 1, amount: 60000, expense_date: "2026-09-12", description: "Junior developer & assistant staff salary" },
  { expense_type_id: 3, expense_type: "Commercial Utilities", expense_category: "BUSINESS", is_tax_deductible: 1, amount: 25000, expense_date: "2026-10-18", description: "Office electricity, water, and broadband fiber" },
  { expense_type_id: 4, expense_type: "Advertising & Marketing", expense_category: "BUSINESS", is_tax_deductible: 1, amount: 35000, expense_date: "2026-11-22", description: "Online social campaigns and ad spend" },
  { expense_type_id: 5, expense_type: "Office Supplies & Stationery", expense_category: "BUSINESS", is_tax_deductible: 1, amount: 15000, expense_date: "2026-12-14", description: "Stationery, paper, toner, and supplies" },
  { expense_type_id: 6, expense_type: "Official Travel & Conveyance", expense_category: "BUSINESS", is_tax_deductible: 1, amount: 25000, expense_date: "2027-01-20", description: "Client visits and domestic business trips" },
  { expense_type_id: 7, expense_type: "Legal & Professional Consultancy", expense_category: "BUSINESS", is_tax_deductible: 1, amount: 30000, expense_date: "2027-02-15", description: "Audit, legal advisory, and tax retainer" },
  { expense_type_id: 8, expense_type: "Equipment Repair & Maintenance", expense_category: "BUSINESS", is_tax_deductible: 1, amount: 20000, expense_date: "2027-03-12", description: "Computer workstation repair & maintenance" },
];

// 5 Personal Expenses (All is_tax_deductible = 0)
const SOHAG_PERSONAL_EXPENSES = [
  { expense_type_id: 9, expense_type: "Residential House Rent", expense_category: "PERSONAL", is_tax_deductible: 0, amount: 180000, expense_date: "2026-08-25", description: "Annual personal residential rent" },
  { expense_type_id: 10, expense_type: "Family Living & Groceries", expense_category: "PERSONAL", is_tax_deductible: 0, amount: 120000, expense_date: "2026-10-25", description: "Household groceries and family living costs" },
  { expense_type_id: 11, expense_type: "Children Education Expenses", expense_category: "PERSONAL", is_tax_deductible: 0, amount: 60000, expense_date: "2026-12-20", description: "School tuition fees, books, and uniforms" },
  { expense_type_id: 12, expense_type: "Personal & Family Healthcare", expense_category: "PERSONAL", is_tax_deductible: 0, amount: 40000, expense_date: "2027-02-18", description: "Medical treatments, prescriptions, and health checkups" },
  { expense_type_id: 13, expense_type: "Residential Utility Bills", expense_category: "PERSONAL", is_tax_deductible: 0, amount: 30000, expense_date: "2027-04-20", description: "Personal residence electricity, gas, and water" },
];

// 6 Eligible Investments (Section 78)
const SOHAG_INVESTMENTS = [
  { tax_year: TAX_YEAR, deduction_code: "DPS", amount: 120000, deduction_date: "2026-09-25", description: "Deposit Pension Scheme (DPS, max 120k)", policy_sum_assured: null },
  { tax_year: TAX_YEAR, deduction_code: "LIFE_INSURANCE", amount: 80000, deduction_date: "2026-11-30", description: "Life Insurance Premium (10% of 1M assured)", policy_sum_assured: 1000000 },
  { tax_year: TAX_YEAR, deduction_code: "GOVT_SECURITIES", amount: 150000, deduction_date: "2026-12-28", description: "5-Year Bangladesh Sanchayapatra", policy_sum_assured: null },
  { tax_year: TAX_YEAR, deduction_code: "STOCK_INVESTMENT", amount: 100000, deduction_date: "2027-01-30", description: "Listed Shares & Mutual Funds (DSE)", policy_sum_assured: null },
  { tax_year: TAX_YEAR, deduction_code: "BENEVOLENT_FUND", amount: 25000, deduction_date: "2027-03-10", description: "Approved Benevolent & Group Insurance Fund", policy_sum_assured: null },
  { tax_year: TAX_YEAR, deduction_code: "ZAKAT", amount: 25000, deduction_date: "2027-04-25", description: "Government Approved Zakat Fund Contribution", policy_sum_assured: null },
];

// Tax Categories Test Cases
const CATEGORY_TEST_CASES = [
  {
    name: "1. GENERAL (General Individual Taxpayer - Base Threshold ৳375,000)",
    category: "GENERAL",
    profile: {
      date_of_birth: "1990-06-15",
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
    expected: {
      category: "GENERAL",
      baseThreshold: 375000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 333750,
      rebate: 64500,
      taxAfterRebate: 269250,
      minimumTax: 5000,
      taxLiability: 269250,
      surcharge: 0,
      totalPayable: 269250,
      credits: 15000,
      finalPayable: 254250,
    },
  },
  {
    name: "2. WOMEN (Female Individual Taxpayer - Base Threshold ৳425,000)",
    category: "WOMEN",
    profile: {
      date_of_birth: "1992-08-20",
      gender: "FEMALE",
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
    expected: {
      category: "WOMEN",
      baseThreshold: 425000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 321250,
      rebate: 64500,
      taxAfterRebate: 256750,
      minimumTax: 5000,
      taxLiability: 256750,
      surcharge: 0,
      totalPayable: 256750,
      credits: 15000,
      finalPayable: 241750,
    },
  },
  {
    name: "3. SENIOR_CITIZEN (Age 65+ Taxpayer - Base Threshold ৳425,000)",
    category: "SENIOR_CITIZEN",
    profile: {
      date_of_birth: "1958-01-10", // Age ~68 on 2026-06-30
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
    expected: {
      category: "SENIOR_CITIZEN",
      baseThreshold: 425000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 321250,
      rebate: 64500,
      taxAfterRebate: 256750,
      minimumTax: 5000,
      taxLiability: 256750,
      surcharge: 0,
      totalPayable: 256750,
      credits: 15000,
      finalPayable: 241750,
    },
  },
  {
    name: "4. PHYSICALLY_CHALLENGED (Person with Disability - Base Threshold ৳500,000)",
    category: "PHYSICALLY_CHALLENGED",
    profile: {
      date_of_birth: "1990-06-15",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 1,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 25000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 5000,
      advance_tax_amount: 10000,
    },
    expected: {
      category: "PHYSICALLY_CHALLENGED",
      baseThreshold: 500000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 302500,
      rebate: 64500,
      taxAfterRebate: 238000,
      minimumTax: 5000,
      taxLiability: 238000,
      surcharge: 0,
      totalPayable: 238000,
      credits: 15000,
      finalPayable: 223000,
    },
  },
  {
    name: "5. THIRD_GENDER (Third Gender Taxpayer - Base Threshold ৳500,000)",
    category: "THIRD_GENDER",
    profile: {
      date_of_birth: "1990-06-15",
      gender: "THIRD_GENDER",
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
    expected: {
      category: "THIRD_GENDER",
      baseThreshold: 500000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 302500,
      rebate: 64500,
      taxAfterRebate: 238000,
      minimumTax: 5000,
      taxLiability: 238000,
      surcharge: 0,
      totalPayable: 238000,
      credits: 15000,
      finalPayable: 223000,
    },
  },
  {
    name: "6. WAR_WOUNDED_FREEDOM_FIGHTER (Gazetted Freedom Fighter - Base Threshold ৳525,000)",
    category: "WAR_WOUNDED_FREEDOM_FIGHTER",
    profile: {
      date_of_birth: "1950-01-01",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 1,
      is_july_warrior: 0,
      net_wealth: 25000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 5000,
      advance_tax_amount: 10000,
    },
    expected: {
      category: "WAR_WOUNDED_FREEDOM_FIGHTER",
      baseThreshold: 525000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 296250,
      rebate: 64500,
      taxAfterRebate: 231750,
      minimumTax: 5000,
      taxLiability: 231750,
      surcharge: 0,
      totalPayable: 231750,
      credits: 15000,
      finalPayable: 216750,
    },
  },
  {
    name: "7. JULY_WARRIOR (July 2024 Mass-Uprising Participant - Base Threshold ৳525,000)",
    category: "JULY_WARRIOR",
    profile: {
      date_of_birth: "1998-07-20",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 1,
      net_wealth: 25000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 5000,
      advance_tax_amount: 10000,
    },
    expected: {
      category: "JULY_WARRIOR",
      baseThreshold: 525000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 296250,
      rebate: 64500,
      taxAfterRebate: 231750,
      minimumTax: 5000,
      taxLiability: 231750,
      surcharge: 0,
      totalPayable: 231750,
      credits: 15000,
      finalPayable: 216750,
    },
  },
  {
    name: "8. DISABLED_CHILD_BENEFIT (General + 2 Disabled Dependents = +৳100,000 Threshold)",
    category: "GENERAL",
    profile: {
      date_of_birth: "1990-06-15",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 2, // 375,000 + 2 * 50,000 = 475,000
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 25000000,
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 5000,
      advance_tax_amount: 10000,
    },
    expected: {
      category: "GENERAL",
      baseThreshold: 475000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 308750,
      rebate: 64500,
      taxAfterRebate: 244250,
      minimumTax: 5000,
      taxLiability: 244250,
      surcharge: 0,
      totalPayable: 244250,
      credits: 15000,
      finalPayable: 229250,
    },
  },
  {
    name: "9. NEW_TAXPAYER_CONCESSION (First-Time Tax Filer Minimum Tax Concession)",
    category: "GENERAL",
    profile: {
      date_of_birth: "1990-06-15",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 1, // Minimum tax rule evaluates to 1,000
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
    expected: {
      category: "GENERAL",
      baseThreshold: 375000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 333750,
      rebate: 64500,
      taxAfterRebate: 269250,
      minimumTax: 1000, // Concessional rate for first-time filer
      taxLiability: 269250,
      surcharge: 0,
      totalPayable: 269250,
      credits: 15000,
      finalPayable: 254250,
    },
  },
  {
    name: "10. HIGH_NET_WEALTH_SURCHARGE (Net Wealth ৳6 Crore -> 10% Wealth Surcharge)",
    category: "GENERAL",
    profile: {
      date_of_birth: "1990-06-15",
      gender: "MALE",
      minimum_tax_area: "REGULAR_TAXPAYER",
      is_new_taxpayer: 0,
      is_physically_challenged: 0,
      disabled_child_dependents: 0,
      is_freedom_fighter: 0,
      is_july_warrior: 0,
      net_wealth: 60000000, // ৳ 6 Crore -> 10% Surcharge
      has_multiple_motor_vehicles: 0,
      has_large_house_property: 0,
      tds_amount: 5000,
      advance_tax_amount: 10000,
    },
    expected: {
      category: "GENERAL",
      baseThreshold: 375000,
      totalIncome: 2820000,
      salaryExemption: 380000,
      deductibleExpense: 290000,
      taxableIncome: 2150000,
      grossTax: 333750,
      rebate: 64500,
      taxAfterRebate: 269250,
      minimumTax: 5000,
      taxLiability: 269250,
      surcharge: 26925, // 10% of 269,250
      totalPayable: 296175,
      credits: 15000,
      finalPayable: 281175,
    },
  },
];

async function runTest() {
  console.log("================================================================================");
  console.log(" BANGLADESH INCOME TAX CALCULATION & FILING SYSTEM - FULL VERIFICATION TEST");
  console.log(" USER: sohag@gmail.com | PASSWORD: sohag@123");
  console.log(" 15 Incomes | 8 Business Expenses | 5 Personal Expenses | 6 Investments");
  console.log("================================================================================\n");

  // Step 1: Login
  console.log("--> Authenticating user sohag@gmail.com...");
  const authResponse = await apiRequest("/auth/login", "POST", CREDENTIALS);
  const token = authResponse.token;
  const user = authResponse.user;
  console.log(`--> Successfully authenticated. User ID: ${user.id}, Full Name: ${user.full_name}, Email: ${user.email}\n`);

  // Step 2: Seed Incomes, Expenses, and Deductions in database
  console.log("--> Preparing database records for sohag@gmail.com...");
  const { query } = require("./src/database/query");

  // Clear existing records for clean test run
  await query("DELETE FROM income WHERE user_id = ?", [user.id]);
  await query("DELETE FROM expenses WHERE user_id = ?", [user.id]);
  await query("DELETE FROM tax_deductions WHERE user_id = ?", [user.id]);

  // Insert 15 Incomes
  for (const inc of SOHAG_INCOMES) {
    await query(
      "INSERT INTO income (user_id, income_type, source_name, amount, income_date, description) VALUES (?, ?, ?, ?, ?, ?)",
      [user.id, inc.income_type, inc.source_name, inc.amount, inc.income_date, inc.description]
    );
  }
  console.log(`--> Inserted 15 Income records (Total Gross Income: BDT 2,820,000)`);

  // Insert 8 Business Expenses
  for (const exp of SOHAG_BUSINESS_EXPENSES) {
    await query(
      "INSERT INTO expenses (user_id, expense_type_id, expense_type, expense_category, is_tax_deductible, amount, expense_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user.id, exp.expense_type_id, exp.expense_type, exp.expense_category, exp.is_tax_deductible, exp.amount, exp.expense_date, exp.description]
    );
  }
  console.log(`--> Inserted 8 Business Expense records (Total Deductible: BDT 290,000)`);

  // Insert 5 Personal Expenses
  for (const exp of SOHAG_PERSONAL_EXPENSES) {
    await query(
      "INSERT INTO expenses (user_id, expense_type_id, expense_type, expense_category, is_tax_deductible, amount, expense_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [user.id, exp.expense_type_id, exp.expense_type, exp.expense_category, exp.is_tax_deductible, exp.amount, exp.expense_date, exp.description]
    );
  }
  console.log(`--> Inserted 5 Personal Expense records (Total Living Expenses: BDT 430,000)`);

  // Insert 6 Investments
  for (const inv of SOHAG_INVESTMENTS) {
    await query(
      "INSERT INTO tax_deductions (user_id, tax_year, deduction_code, amount, description, deduction_date, policy_sum_assured) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [user.id, inv.tax_year, inv.deduction_code, inv.amount, inv.description, inv.deduction_date, inv.policy_sum_assured]
    );
  }
  console.log(`--> Inserted 6 Investment records (Total Allowable: BDT 500,000)\n`);

  let totalTests = CATEGORY_TEST_CASES.length;
  let passedTests = 0;
  let failedTests = 0;

  for (let i = 0; i < CATEGORY_TEST_CASES.length; i++) {
    const testCase = CATEGORY_TEST_CASES[i];
    console.log("--------------------------------------------------------------------------------");
    console.log(`TEST [${i + 1}/${totalTests}]: ${testCase.name}`);
    console.log("--------------------------------------------------------------------------------");

    // Upsert taxpayer profile
    const existingProfiles = await query("SELECT id FROM taxpayer_profiles WHERE user_id = ?", [user.id]);
    if (existingProfiles.length > 0) {
      await query(
        `UPDATE taxpayer_profiles SET 
          date_of_birth = ?, gender = ?, minimum_tax_area = ?, is_new_taxpayer = ?,
          is_physically_challenged = ?, disabled_child_dependents = ?, is_freedom_fighter = ?,
          is_july_warrior = ?, net_wealth = ?, has_multiple_motor_vehicles = ?,
          has_large_house_property = ?, tds_amount = ?, advance_tax_amount = ?
        WHERE user_id = ?`,
        [
          testCase.profile.date_of_birth,
          testCase.profile.gender,
          testCase.profile.minimum_tax_area,
          testCase.profile.is_new_taxpayer,
          testCase.profile.is_physically_challenged,
          testCase.profile.disabled_child_dependents,
          testCase.profile.is_freedom_fighter,
          testCase.profile.is_july_warrior,
          testCase.profile.net_wealth,
          testCase.profile.has_multiple_motor_vehicles,
          testCase.profile.has_large_house_property,
          testCase.profile.tds_amount,
          testCase.profile.advance_tax_amount,
          user.id,
        ]
      );
    } else {
      await query(
        `INSERT INTO taxpayer_profiles (
          user_id, date_of_birth, gender, minimum_tax_area, is_new_taxpayer,
          is_physically_challenged, disabled_child_dependents, is_freedom_fighter,
          is_july_warrior, net_wealth, has_multiple_motor_vehicles,
          has_large_house_property, tds_amount, advance_tax_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          testCase.profile.date_of_birth,
          testCase.profile.gender,
          testCase.profile.minimum_tax_area,
          testCase.profile.is_new_taxpayer,
          testCase.profile.is_physically_challenged,
          testCase.profile.disabled_child_dependents,
          testCase.profile.is_freedom_fighter,
          testCase.profile.is_july_warrior,
          testCase.profile.net_wealth,
          testCase.profile.has_multiple_motor_vehicles,
          testCase.profile.has_large_house_property,
          testCase.profile.tds_amount,
          testCase.profile.advance_tax_amount,
        ]
      );
    }

    // Call live calculation API
    const calcResponse = await apiRequest("/tax-calculations", "POST", { tax_year: TAX_YEAR }, token);
    const result = calcResponse.data;

    // Helper for formatting currency
    const fmt = (num) => "৳ " + Number(num || 0).toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // Assertions
    const asserts = [
      { field: "Taxpayer Category", actual: result.category, expected: testCase.expected.category },
      { field: "Tax-Free Threshold", actual: Number(result.taxFreeThreshold), expected: testCase.expected.baseThreshold },
      { field: "Total Gross Income", actual: Number(result.totalIncome), expected: testCase.expected.totalIncome },
      { field: "Salary Exemption", actual: Number(result.salaryExemption), expected: testCase.expected.salaryExemption },
      { field: "Taxable Income", actual: Number(result.taxableIncome), expected: testCase.expected.taxableIncome },
      { field: "Gross Tax", actual: Number(result.grossTax), expected: testCase.expected.grossTax },
      { field: "Tax Rebate (Sec 78)", actual: Number(result.taxRebate), expected: testCase.expected.rebate },
      { field: "Tax After Rebate", actual: Number(result.taxAfterRebate), expected: testCase.expected.taxAfterRebate },
      { field: "Minimum Tax Amount", actual: Number(result.minimumTax), expected: testCase.expected.minimumTax },
      { field: "Tax Liability", actual: Number(result.taxLiability), expected: testCase.expected.taxLiability },
      { field: "Wealth Surcharge", actual: Number(result.surchargeAmount), expected: testCase.expected.surcharge },
      { field: "Total Tax Payable", actual: Number(result.totalTaxPayable), expected: testCase.expected.totalPayable },
      { field: "Tax Credits (TDS/Adv)", actual: Number(result.totalTaxCredits), expected: testCase.expected.credits },
      { field: "Final Amount Payable", actual: Number(result.finalPayable), expected: testCase.expected.finalPayable },
    ];

    let casePassed = true;
    for (const a of asserts) {
      const match = a.actual === a.expected;
      if (!match) casePassed = false;
      const displayActual = typeof a.actual === "number" ? fmt(a.actual) : a.actual;
      const displayExpected = typeof a.expected === "number" ? fmt(a.expected) : a.expected;
      const statusIcon = match ? "✓" : "✗";
      console.log(`  ${a.field.padEnd(23)}: ${displayActual.padEnd(16)} (Expected: ${displayExpected}) ${statusIcon}`);
    }

    if (casePassed) {
      passedTests++;
      console.log(`  STATUS                : >>> PASS (100% compliant with NBR Paripatra AY 2026-27 & Income Tax Act 2023) <<<`);
    } else {
      failedTests++;
      console.log(`  STATUS                : >>> FAIL <<<`);
    }
  }

  // Restore regular profile for Sohag so he can browse properly in dashboard
  await query(
    `UPDATE taxpayer_profiles SET 
      date_of_birth = '1990-06-15', gender = 'MALE', minimum_tax_area = 'REGULAR_TAXPAYER', is_new_taxpayer = 0,
      is_physically_challenged = 0, disabled_child_dependents = 0, is_freedom_fighter = 0,
      is_july_warrior = 0, net_wealth = 25000000, has_multiple_motor_vehicles = 0,
      has_large_house_property = 0, tds_amount = 5000, advance_tax_amount = 10000
    WHERE user_id = ?`,
    [user.id]
  );

  console.log("\n================================================================================");
  console.log(` EXECUTION SUMMARY FOR USER: ${user.email}`);
  console.log(` TOTAL CATEGORY TESTS : ${totalTests}`);
  console.log(` PASSED               : ${passedTests}`);
  console.log(` FAILED               : ${failedTests}`);
  console.log("================================================================================\n");

  if (failedTests === 0) {
    console.log("✓ ALL 10 TESTS PASSED ACCURATELY AGAINST OFFICIAL BANGLADESH NBR RULES!");
    console.log("✓ User sohag@gmail.com has 15 Incomes, 8 Business Expenses, 5 Personal Expenses, and 6 Investments ready in database!");
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
