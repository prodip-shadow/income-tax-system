require("dotenv").config({ path: ".env" });
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

/**
 * INDEPENDENT REFERENCE CALCULATOR
 * 
 * Implemented completely independently from production code,
 * following authoritative NBR Paripatras and Income Tax Act 2023:
 * - Paripatra 2023-2024 (Oct 2023)
 * - Paripatra 2024-2025 (June 2024)
 * - Paripatra 2025-2026 (June 2025, covering AY 2025-26 & AY 2026-27)
 */
class IndependentReferenceCalculator {
  static roundMoney(val) {
    return Math.round((Number(val) || 0) * 100) / 100;
  }

  static getThreshold(taxYear, category, disabledChildDependents = 0) {
    let base = 0;
    if (taxYear === "2026-27") {
      switch (category) {
        case "WOMEN":
        case "SENIOR_CITIZEN":
          base = 425000; break;
        case "PHYSICALLY_CHALLENGED":
        case "THIRD_GENDER":
          base = 500000; break;
        case "WAR_WOUNDED_FREEDOM_FIGHTER":
        case "JULY_WARRIOR":
          base = 525000; break;
        default:
          base = 375000; break;
      }
    } else {
      // AY 2023-24, 2024-25, 2025-26
      switch (category) {
        case "WOMEN":
        case "SENIOR_CITIZEN":
          base = 400000; break;
        case "PHYSICALLY_CHALLENGED":
        case "THIRD_GENDER":
          base = 475000; break;
        case "WAR_WOUNDED_FREEDOM_FIGHTER":
          base = 500000; break;
        case "JULY_WARRIOR":
          // Not legally applicable prior to 2026-27
          base = 350000; break;
        default:
          base = 350000; break;
      }
    }
    return base + (Number(disabledChildDependents) || 0) * 50000;
  }

  static getSalaryExemption(taxYear, salaryIncome) {
    const cap = ["2025-26", "2026-27"].includes(taxYear) ? 500000 : 450000;
    return this.roundMoney(Math.min((salaryIncome || 0) / 3, cap));
  }

  static calculateGrossTax(taxYear, taxableIncome, threshold) {
    if (taxableIncome <= threshold) {
      return { grossTax: 0, slabs: [{ slab: "Tax-Free Threshold", amount: taxableIncome, rate: 0, tax: 0 }] };
    }

    const slabs = [{ slab: "Tax-Free Threshold", amount: threshold, rate: 0, tax: 0 }];
    let remaining = taxableIncome - threshold;
    let grossTax = 0;

    let slabDefs = [];
    if (taxYear === "2023-24") {
      slabDefs = [
        { span: 100000, rate: 5 },
        { span: 300000, rate: 10 },
        { span: 400000, rate: 15 },
        { span: 500000, rate: 20 },
        { span: Infinity, rate: 25 },
      ];
    } else if (taxYear === "2024-25") {
      slabDefs = [
        { span: 100000, rate: 5 },
        { span: 400000, rate: 10 },
        { span: 500000, rate: 15 },
        { span: 500000, rate: 20 },
        { span: Infinity, rate: 25 },
      ];
    } else if (taxYear === "2025-26") {
      slabDefs = [
        { span: 100000, rate: 5 },
        { span: 400000, rate: 10 },
        { span: 500000, rate: 15 },
        { span: 500000, rate: 20 },
        { span: 2000000, rate: 25 },
        { span: Infinity, rate: 30 },
      ];
    } else if (taxYear === "2026-27") {
      slabDefs = [
        { span: 300000, rate: 10 },
        { span: 400000, rate: 15 },
        { span: 500000, rate: 20 },
        { span: 2000000, rate: 25 },
        { span: Infinity, rate: 30 },
      ];
    }

    for (const def of slabDefs) {
      if (remaining <= 0) break;
      const portion = Math.min(remaining, def.span);
      const tax = this.roundMoney(portion * (def.rate / 100));
      slabs.push({
        slab: def.span === Infinity ? `Remaining Balance` : `Next BDT ${def.span}`,
        amount: portion,
        rate: def.rate,
        tax,
      });
      grossTax = this.roundMoney(grossTax + tax);
      remaining -= portion;
    }

    return { grossTax, slabs };
  }

  static calculateRebate(taxableIncome, eligibleInvestment, grossTax) {
    const limitByIncome = this.roundMoney(taxableIncome * 0.03);
    const limitByInv = this.roundMoney(eligibleInvestment * 0.15);
    const absoluteLimit = 1000000;
    const allowableRebate = Math.min(limitByIncome, limitByInv, absoluteLimit);
    const taxRebate = this.roundMoney(Math.min(allowableRebate, grossTax));
    return { taxRebate, limitByIncome, limitByInv, absoluteLimit };
  }

  static getMinimumTax(taxYear, profile) {
    if (taxYear === "2026-27") {
      return Number(profile.is_new_taxpayer) === 1 ? 1000 : 5000;
    }
    // 2023-24, 2024-25, 2025-26
    const area = String(profile.minimum_tax_area || "DHAKA_NORTH").toUpperCase();
    if (["DHAKA_NORTH", "DHAKA_SOUTH", "CHATTOGRAM"].includes(area)) {
      return 5000;
    }
    if (area === "OTHER_CITY") {
      return 4000;
    }
    return 3000;
  }

  static getSurcharge(netWealth, hasMultipleCars, hasLargeHouse) {
    let rate = 0;
    if (netWealth > 500000000) rate = 35;
    else if (netWealth > 200000000) rate = 30;
    else if (netWealth > 100000000) rate = 20;
    else if (netWealth > 40000000) rate = 10;
    else rate = 0;

    if ((hasMultipleCars || hasLargeHouse) && rate < 10) {
      rate = 10;
    }
    return rate;
  }

  static compute(scenario) {
    const {
      taxYear,
      category,
      totalIncome,
      salaryIncome = 0,
      businessExpense = 0,
      eligibleInvestment = 0,
      profile = {},
    } = scenario;

    // 1. Exemption & Deductions
    const salaryExemption = this.getSalaryExemption(taxYear, salaryIncome);
    const totalDeduction = this.roundMoney(salaryExemption + businessExpense);
    const taxableIncome = this.roundMoney(Math.max(totalIncome - totalDeduction, 0));

    // 2. Threshold
    const threshold = this.getThreshold(taxYear, category, profile.disabled_child_dependents || 0);

    // 3. Gross Tax
    const { grossTax, slabs } = this.calculateGrossTax(taxYear, taxableIncome, threshold);

    // 4. Tax Rebate
    const { taxRebate, limitByIncome, limitByInv } = this.calculateRebate(taxableIncome, eligibleInvestment, grossTax);
    const netTax = this.roundMoney(Math.max(grossTax - taxRebate, 0));

    // 5. Minimum Tax
    const minTaxAmount = this.getMinimumTax(taxYear, profile);
    const minTaxApplicable = totalIncome > threshold;
    const taxLiability = this.roundMoney(minTaxApplicable ? Math.max(netTax, minTaxAmount) : 0);

    // 6. Wealth Surcharge
    const netWealth = Number(profile.net_wealth || 0);
    const hasMultipleCars = Number(profile.has_multiple_motor_vehicles || 0) === 1;
    const hasLargeHouse = Number(profile.has_large_house_property || 0) === 1;
    const surchargeRate = this.getSurcharge(netWealth, hasMultipleCars, hasLargeHouse);
    const surchargeAmount = this.roundMoney(taxLiability * (surchargeRate / 100));
    const totalTaxPayable = this.roundMoney(taxLiability + surchargeAmount);

    // 7. Credits
    const tds = Number(profile.tds_amount || 0);
    const adv = Number(profile.advance_tax_amount || 0);
    const totalCredits = this.roundMoney(tds + adv);
    const finalPayable = this.roundMoney(totalTaxPayable - totalCredits);

    return {
      taxYear,
      category,
      threshold,
      salaryExemption,
      totalDeduction,
      taxableIncome,
      slabs,
      grossTax,
      taxRebate,
      netTax,
      minTaxAmount,
      minTaxApplicable,
      taxLiability,
      surchargeRate,
      surchargeAmount,
      totalTaxPayable,
      totalCredits,
      finalPayable,
    };
  }
}

async function runTestSuite() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const testUserId = 999;
  const token = jwt.sign(
    { id: testUserId, email: "qa_verification@tax.gov.bd", role: "user" },
    process.env.JWT_SECRET || "ThisIsMy1stJWTtoken@Rafy!",
    { expiresIn: "2h" }
  );

  // Setup QA test user in DB
  await conn.query(`DELETE FROM users WHERE id = ?`, [testUserId]);
  await conn.query(`
    INSERT INTO users (id, full_name, email, password, phone, nid, role, is_verified)
    VALUES (?, 'QA Independent Tester', 'qa_verification@tax.gov.bd', 'hash123', '01999999999', '19999999999999999', 'user', 1)
  `, [testUserId]);

  const testScenarios = [
    // ---------------- AY 2023-24 ----------------
    {
      name: "AY 2023-24: GENERAL at 0 income",
      taxYear: "2023-24",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 0,
      source: "Finance Act 2023, Second Schedule",
    },
    {
      name: "AY 2023-24: GENERAL at Threshold - 1 (349,999)",
      taxYear: "2023-24",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 349999,
      source: "Finance Act 2023, Second Schedule",
    },
    {
      name: "AY 2023-24: GENERAL at Threshold (350,000)",
      taxYear: "2023-24",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 350000,
      source: "Finance Act 2023, Second Schedule",
    },
    {
      name: "AY 2023-24: GENERAL at Threshold + 1 (350,001 - Minimum Tax 5000 applies)",
      taxYear: "2023-24",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 350001,
      source: "Paripatra 2023-24 Section 1.1",
    },
    {
      name: "AY 2023-24: GENERAL at Slab 2 End (450,000 - Gross Tax 5,000)",
      taxYear: "2023-24",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "OTHER_CITY" },
      totalIncome: 450000,
      source: "Paripatra 2023-24 Section 1.1",
    },
    {
      name: "AY 2023-24: WOMEN in Other City Area (Threshold 400,000, Min Tax 4,000)",
      taxYear: "2023-24",
      category: "WOMEN",
      profile: { gender: "FEMALE", minimum_tax_area: "OTHER_CITY" },
      totalIncome: 405000,
      source: "Paripatra 2023-24 Section 1.1",
    },
    {
      name: "AY 2023-24: High Income (2,000,000) with 25% top slab & Salary Exemption",
      taxYear: "2023-24",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 2000000,
      salaryIncome: 1200000, // Exemption: min(1200k/3, 450k) = 400k -> Taxable: 1,600,000
      source: "6th Schedule Part 1, clause 27",
    },

    // ---------------- AY 2024-25 ----------------
    {
      name: "AY 2024-25: GENERAL at Threshold (350,000)",
      taxYear: "2024-25",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 350000,
      source: "Paripatra 2024-25 Section 1.1",
    },
    {
      name: "AY 2024-25: GENERAL at 850,000 (Slab 3 End: 0% + 5% on 100k + 10% on 400k)",
      taxYear: "2024-25",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 850000,
      source: "Finance Act 2024 Second Schedule",
    },
    {
      name: "AY 2024-25: High Income (4,000,000) with Top Slab 25% (NO 30% slab!)",
      taxYear: "2024-25",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "POURASHAVA" },
      totalIncome: 4000000,
      source: "Paripatra 2024-25 Section 1.1 Page 1",
    },
    {
      name: "AY 2024-25: SENIOR_CITIZEN (65+) in Pourashava (Threshold 400,000, Min Tax 3,000)",
      taxYear: "2024-25",
      category: "SENIOR_CITIZEN",
      profile: { gender: "MALE", date_of_birth: "1955-01-01", minimum_tax_area: "POURASHAVA" },
      totalIncome: 410000,
      source: "Paripatra 2024-25 Section 1.1",
    },
    {
      name: "AY 2024-25: Dependent with Disability (+50k Threshold: 400,000)",
      taxYear: "2024-25",
      category: "GENERAL",
      profile: { gender: "MALE", disabled_child_dependents: 1, minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 390000,
      source: "Paripatra 2024-25 Section 1.1 Page 2",
    },

    // ---------------- AY 2025-26 ----------------
    {
      name: "AY 2025-26: GENERAL at Threshold (350,000 - Section 2.1)",
      taxYear: "2025-26",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 350000,
      source: "Paripatra 2025-26 Section 2.1 Page 7",
    },
    {
      name: "AY 2025-26: GENERAL with 500k Salary Exemption (Section 59.5, Page 80)",
      taxYear: "2025-26",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 1800000,
      salaryIncome: 1800000, // Exemption: min(1800k/3, 500k) = 500k -> Taxable: 1,300,000
      source: "Paripatra 2025-26 Section 59.5 Page 80",
    },
    {
      name: "AY 2025-26: Area-Based Min Tax in Other Area / Rural (3,000)",
      taxYear: "2025-26",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "OTHER_AREA" },
      totalIncome: 360000,
      source: "Paripatra 2025-26 Section 2.1 Page 8",
    },
    {
      name: "AY 2025-26: Top Slab 30% above 3,850,000",
      taxYear: "2025-26",
      category: "GENERAL",
      profile: { gender: "MALE", minimum_tax_area: "DHAKA_NORTH" },
      totalIncome: 4850000,
      source: "Paripatra 2025-26 Section 2.1 Page 7",
    },

    // ---------------- AY 2026-27 ----------------
    {
      name: "AY 2026-27: GENERAL at New Threshold (375,000 - Section 1.1)",
      taxYear: "2026-27",
      category: "GENERAL",
      profile: { gender: "MALE", is_new_taxpayer: 0 },
      totalIncome: 375000,
      source: "Paripatra 2025-26 Section 1.1 Page 1",
    },
    {
      name: "AY 2026-27: Regular Taxpayer Minimum Tax (5,000 Nationwide)",
      taxYear: "2026-27",
      category: "GENERAL",
      profile: { gender: "MALE", is_new_taxpayer: 0 },
      totalIncome: 376000,
      source: "Paripatra 2025-26 Section 1.1 Page 2",
    },
    {
      name: "AY 2026-27: New Taxpayer Minimum Tax (1,000 Nationwide)",
      taxYear: "2026-27",
      category: "GENERAL",
      profile: { gender: "MALE", is_new_taxpayer: 1 },
      totalIncome: 376000,
      source: "Paripatra 2025-26 Section 1.1 Page 2",
    },
    {
      name: "AY 2026-27: JULY_WARRIOR Category (525,000 Threshold)",
      taxYear: "2026-27",
      category: "JULY_WARRIOR",
      profile: { gender: "MALE", is_july_warrior: 1 },
      totalIncome: 525000,
      source: "Paripatra 2025-26 Section 1.1 Page 2",
    },
    {
      name: "AY 2026-27: Progressive Slabs Start at 10% on 300,000 (NO 5% slab)",
      taxYear: "2026-27",
      category: "GENERAL",
      profile: { gender: "MALE", is_new_taxpayer: 0 },
      totalIncome: 675000, // 375k @ 0% + 300k @ 10% = 30,000
      source: "Paripatra 2025-26 Section 1.1 Page 1",
    },
    {
      name: "AY 2026-27: Section 78 Investment Rebate with DPS limit",
      taxYear: "2026-27",
      category: "GENERAL",
      profile: { gender: "MALE", is_new_taxpayer: 0 },
      totalIncome: 1000000,
      eligibleInvestment: 120000, // Rebate: 15% * 120k = 18,000 (3% limit = 30,000)
      source: "Paripatra 2025-26 Section 19 Page 47 & Section 78",
    },
    {
      name: "AY 2026-27: Wealth Surcharge Tier 1 (4Cr-10Cr: 10% Surcharge)",
      taxYear: "2026-27",
      category: "GENERAL",
      profile: { gender: "MALE", net_wealth: 60000000, is_new_taxpayer: 0 },
      totalIncome: 1500000,
      source: "Paripatra 2025-26 Section 1.4 Page 4",
    },
    {
      name: "AY 2026-27: Wealth Surcharge Trigger (>1 Motor Vehicle triggers 10%)",
      taxYear: "2026-27",
      category: "GENERAL",
      profile: { gender: "MALE", net_wealth: 10000000, has_multiple_motor_vehicles: 1, is_new_taxpayer: 0 },
      totalIncome: 1500000,
      source: "Paripatra 2025-26 Section 1.4 Page 4",
    },
    {
      name: "AY 2026-27: TDS and Advance Tax Credits with Refund Case",
      taxYear: "2026-27",
      category: "GENERAL",
      profile: { gender: "MALE", is_new_taxpayer: 0, tds_amount: 50000, advance_tax_amount: 10000 },
      totalIncome: 675000, // Tax payable 30,000 - Credits 60,000 = -30,000 refund
      source: "Section 153/154 & Tax Credits",
    },
  ];

  console.log("================================================================================");
  console.log("   INDEPENDENT REFERENCE QA VERIFICATION & GOLDEN TEST SUITE");
  console.log("   Authoritative Sources: Official NBR Paripatras 2023-24, 2024-25, 2025-26, 2026-27");
  console.log("================================================================================\n");

  let passCount = 0;
  let failCount = 0;
  let blockedCount = 0;

  for (let i = 0; i < testScenarios.length; i++) {
    const sc = testScenarios[i];
    console.log(`[TEST ${i + 1}/${testScenarios.length}] ${sc.name}`);
    console.log(`Applicable Legal Instrument: ${sc.source}`);

    // 1. Compute expected from Independent Reference Calculator
    const expected = IndependentReferenceCalculator.compute(sc);

    // 2. Prepare database environment for this test scenario
    try {
      // Clear user income, expenses, deductions, profiles, calculations
      await conn.query(`DELETE FROM tax_calculation_details WHERE tax_calculation_id IN (SELECT id FROM tax_calculations WHERE user_id = ?)`, [testUserId]);
      await conn.query(`DELETE FROM tax_calculations WHERE user_id = ?`, [testUserId]);
      await conn.query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);
      await conn.query(`DELETE FROM expenses WHERE user_id = ?`, [testUserId]);
      await conn.query(`DELETE FROM tax_deductions WHERE user_id = ?`, [testUserId]);
      await conn.query(`DELETE FROM taxpayer_profiles WHERE user_id = ?`, [testUserId]);

      // Insert Profile
      const p = sc.profile;
      const isFreedomFighter = sc.category === "WAR_WOUNDED_FREEDOM_FIGHTER" ? 1 : 0;
      const isJulyWarrior = p.is_july_warrior || (sc.category === "JULY_WARRIOR" ? 1 : 0);
      const isPhysicallyChallenged = sc.category === "PHYSICALLY_CHALLENGED" ? 1 : 0;
      const gender = sc.category === "WOMEN" ? "FEMALE" : (sc.category === "THIRD_GENDER" ? "THIRD_GENDER" : (p.gender || "MALE"));
      const dob = p.date_of_birth || (sc.category === "SENIOR_CITIZEN" ? "1955-01-01" : "1990-01-01");

      await conn.query(`
        INSERT INTO taxpayer_profiles (
          user_id, gender, date_of_birth, is_freedom_fighter, is_july_warrior,
          is_physically_challenged, disabled_child_dependents, minimum_tax_area,
          is_new_taxpayer, net_wealth, has_multiple_motor_vehicles, has_large_house_property,
          tds_amount, advance_tax_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        testUserId, gender, dob, isFreedomFighter, isJulyWarrior,
        isPhysicallyChallenged, p.disabled_child_dependents || 0, p.minimum_tax_area || "DHAKA_NORTH",
        p.is_new_taxpayer ? 1 : 0, p.net_wealth || 0, p.has_multiple_motor_vehicles ? 1 : 0, p.has_large_house_property ? 1 : 0,
        p.tds_amount || 0, p.advance_tax_amount || 0
      ]);

      // Set Income dates based on tax year
      const [startYr, endYrSuffix] = sc.taxYear.split("-");
      const incomeDate = `${startYr}-12-15`;

      if (sc.salaryIncome && sc.salaryIncome > 0) {
        await conn.query(`
          INSERT INTO income (user_id, source_name, income_type, amount, income_date)
          VALUES (?, 'Monthly Salary', 'SALARY', ?, ?)
        `, [testUserId, sc.salaryIncome, incomeDate]);
      }

      const otherIncome = sc.totalIncome - (sc.salaryIncome || 0);
      if (otherIncome > 0) {
        await conn.query(`
          INSERT INTO income (user_id, source_name, income_type, amount, income_date)
          VALUES (?, 'Business & Consulting', 'BUSINESS', ?, ?)
        `, [testUserId, otherIncome, incomeDate]);
      }

      if (sc.businessExpense && sc.businessExpense > 0) {
        await conn.query(`
          INSERT INTO expenses (user_id, title, expense_category, amount, is_tax_deductible, expense_date)
          VALUES (?, 'Allowable Business Expense', 'BUSINESS', ?, 1, ?)
        `, [testUserId, sc.businessExpense, incomeDate]);
      }

      if (sc.eligibleInvestment && sc.eligibleInvestment > 0) {
        await conn.query(`
          INSERT INTO tax_deductions (user_id, tax_year, deduction_code, amount, deduction_date)
          VALUES (?, ?, 'DPS', ?, ?)
        `, [testUserId, sc.taxYear, sc.eligibleInvestment, incomeDate]);
      }

      // 3. Call Production API
      const apiRes = await fetch("http://localhost:5000/api/tax-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tax_year: sc.taxYear }),
      }).then(r => r.json());

      if (!apiRes.success) {
        console.error(`  FAIL: Production API returned error: ${apiRes.message}`);
        failCount++;
        continue;
      }

      const apiData = apiRes.data;

      // 4. Fetch Saved Database Record
      const [dbRows] = await conn.query(`
        SELECT * FROM tax_calculations WHERE user_id = ? AND tax_year = ? ORDER BY id DESC LIMIT 1
      `, [testUserId, sc.taxYear]);

      if (dbRows.length === 0) {
        console.error("  FAIL: No record saved in tax_calculations table.");
        failCount++;
        continue;
      }
      const dbData = dbRows[0];

      // 5. Verification checks
      const checks = [
        { field: "Taxable Income", exp: expected.taxableIncome, api: Number(apiData.taxable_income), db: Number(dbData.taxable_income) },
        { field: "Gross Tax", exp: expected.grossTax, api: Number(apiData.gross_tax), db: Number(dbData.gross_tax) },
        { field: "Tax Rebate", exp: expected.taxRebate, api: Number(apiData.tax_rebate), db: Number(dbData.tax_rebate) },
        { field: "Tax Liability", exp: expected.taxLiability, api: Number(apiData.tax_liability), db: Number(dbData.tax_liability) },
        { field: "Surcharge Amount", exp: expected.surchargeAmount, api: Number(apiData.surcharge_amount), db: Number(dbData.surcharge_amount) },
        { field: "Total Tax Payable", exp: expected.totalTaxPayable, api: Number(apiData.total_tax_payable), db: Number(dbData.total_tax_payable) },
        { field: "Final Payable / Refund", exp: expected.finalPayable, api: Number(apiData.final_payable), db: Number(dbData.final_payable) },
      ];

      let scenarioPassed = true;
      for (const chk of checks) {
        const diffApi = Math.abs(chk.exp - chk.api);
        const diffDb = Math.abs(chk.exp - chk.db);
        if (diffApi > 0.01 || diffDb > 0.01) {
          console.error(`  MISMATCH on ${chk.field}: Expected=${chk.exp}, API=${chk.api}, DB=${chk.db}, Diff=${diffApi}`);
          scenarioPassed = false;
        }
      }

      // 6. Print Human-Readable Calculation Worksheet
      console.log("  ----------------- CALCULATION WORKSHEET -----------------");
      console.log(`  Assessment Year: ${expected.taxYear} | Category: ${expected.category} | Threshold: BDT ${expected.threshold.toLocaleString()}`);
      console.log(`  Gross Income: BDT ${sc.totalIncome.toLocaleString()} | Statutory Deductions: BDT ${expected.totalDeduction.toLocaleString()} | Taxable Income: BDT ${expected.taxableIncome.toLocaleString()}`);
      console.log("  Slab Breakdown:");
      for (const sl of expected.slabs) {
        console.log(`    - ${sl.slab.padEnd(25)} : BDT ${sl.amount.toLocaleString().padStart(10)} @ ${String(sl.rate).padStart(2)}% = BDT ${sl.tax.toLocaleString().padStart(9)}`);
      }
      console.log(`  Gross Tax            : BDT ${expected.grossTax.toLocaleString()}`);
      console.log(`  Tax Rebate           : BDT ${expected.taxRebate.toLocaleString()}`);
      console.log(`  Net Tax After Rebate : BDT ${expected.netTax.toLocaleString()}`);
      console.log(`  Minimum Tax (${expected.minTaxApplicable ? "Applied" : "N/A"})  : BDT ${expected.minTaxAmount.toLocaleString()} -> Tax Liability: BDT ${expected.taxLiability.toLocaleString()}`);
      console.log(`  Wealth Surcharge     : ${expected.surchargeRate}% on Base BDT ${expected.taxLiability.toLocaleString()} = BDT ${expected.surchargeAmount.toLocaleString()}`);
      console.log(`  Total Tax Payable    : BDT ${expected.totalTaxPayable.toLocaleString()}`);
      console.log(`  Tax Credits (TDS/Adv): BDT ${expected.totalCredits.toLocaleString()}`);
      console.log(`  Final Amount         : BDT ${expected.finalPayable.toLocaleString()} (${expected.finalPayable < 0 ? "REFUND CLAIM" : "NET TAX PAYABLE"})`);
      console.log("  ---------------------------------------------------------");

      if (scenarioPassed) {
        console.log("  Status: >>> PASS <<< (Independent Expected == Production API == Saved Database)\n");
        passCount++;
      } else {
        console.log("  Status: >>> FAIL <<<\n");
        failCount++;
      }

    } catch (err) {
      console.error(`  ERROR executing test: ${err.message}`);
      failCount++;
    }
  }

  // Cleanup test user
  await conn.query(`DELETE FROM tax_calculation_details WHERE tax_calculation_id IN (SELECT id FROM tax_calculations WHERE user_id = ?)`, [testUserId]);
  await conn.query(`DELETE FROM tax_calculations WHERE user_id = ?`, [testUserId]);
  await conn.query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);
  await conn.query(`DELETE FROM expenses WHERE user_id = ?`, [testUserId]);
  await conn.query(`DELETE FROM tax_deductions WHERE user_id = ?`, [testUserId]);
  await conn.query(`DELETE FROM taxpayer_profiles WHERE user_id = ?`, [testUserId]);
  await conn.query(`DELETE FROM users WHERE id = ?`, [testUserId]);

  await conn.end();

  console.log("================================================================================");
  console.log(`   TEST EXECUTION SUMMARY:`);
  console.log(`   TOTAL TESTS: ${testScenarios.length}`);
  console.log(`   PASS       : ${passCount}`);
  console.log(`   FAIL       : ${failCount}`);
  console.log(`   BLOCKED    : ${blockedCount}`);
  console.log("================================================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
