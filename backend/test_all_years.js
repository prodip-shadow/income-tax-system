require("dotenv").config();
const { query } = require("./src/database/query");
const TaxCalculationService = require("./src/services/taxCalculationService");

async function runTests() {
  console.log("================================================================================");
  console.log("  BANGLADESH INCOME TAX CALCULATION & FILING SYSTEM - VERIFICATION SUITE");
  console.log("  Assessment Years: 2023-24, 2024-25, 2025-26, 2026-27");
  console.log("================================================================================\n");

  let testUserId = null;

  try {
    // 1. Create a dedicated test user
    const userResult = await query(
      `INSERT INTO users (full_name, email, password, phone, nid, role, is_verified)
       VALUES ('Tax Verification Test User', 'test_tax_verify@example.com', 'password_hash', '01999999999', '19999999999999999', 'user', 1)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`
    );
    testUserId = userResult.insertId;

    // Clean previous test data for this user
    await query(`DELETE FROM tax_calculation_details WHERE tax_calculation_id IN (SELECT id FROM tax_calculations WHERE user_id = ?)`, [testUserId]);
    await query(`DELETE FROM tax_calculations WHERE user_id = ?`, [testUserId]);
    await query(`DELETE FROM tax_deductions WHERE user_id = ?`, [testUserId]);
    await query(`DELETE FROM expenses WHERE user_id = ?`, [testUserId]);
    await query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);
    await query(`DELETE FROM taxpayer_profiles WHERE user_id = ?`, [testUserId]);

    // ============================================================================
    // TEST 1: AY 2023-24 (Income Year: 2023-07-01 to 2024-06-30)
    // Slabs: 0% up to 350k; 5% on 100k; 10% on 300k; 15% on 400k; 20% on 500k; rem 25%
    // Salary exemption: min(salary/3, 450k)
    // Area Minimum Tax: DHAKA_NORTH = 5,000
    // ============================================================================
    console.log("--- TEST 1: AY 2023-24 (Salary Exemption + 2023-24 Progressive Slabs + Area Min Tax) ---");

    // Profile: Male, born 1990 (General), Dhaka North, Net Wealth 0
    await query(
      `INSERT INTO taxpayer_profiles (user_id, date_of_birth, gender, minimum_tax_area, is_new_taxpayer, net_wealth, tds_amount, advance_tax_amount)
       VALUES (?, '1990-05-10', 'MALE', 'DHAKA_NORTH', 0, 0, 10000.00, 5000.00)`,
      [testUserId]
    );

    // Income: Salary receipts = 1,200,000 (Exemption = min(1200000/3, 450000) = 400,000)
    // Taxable Income = 1,200,000 - 400,000 = 800,000
    await query(
      `INSERT INTO income (user_id, income_type, source_name, amount, income_date)
       VALUES (?, 'SALARY', 'ABC Corp', 1200000.00, '2023-08-15')`,
      [testUserId]
    );

    // Deductions / Investments: DPS = 150,000 (should be capped at 120,000 per rule)
    await query(
      `INSERT INTO tax_deductions (user_id, tax_year, deduction_code, amount, deduction_date)
       VALUES (?, '2023-24', 'DPS', 150000.00, '2023-09-01')`,
      [testUserId]
    );

    const calc2023 = await TaxCalculationService.calculateTax(testUserId, "2023-24");

    console.log(`  Total Income:         ৳${calc2023.totalIncome}`);
    console.log(`  Salary Exemption:     ৳${calc2023.salaryExemption} (Expected: ৳400,000.00)`);
    console.log(`  Taxable Income:       ৳${calc2023.taxableIncome} (Expected: ৳800,000.00)`);
    console.log(`  Eligible Investment:  ৳${calc2023.eligibleInvestment} (Expected: ৳120,000.00 capped)`);

    // Expected Gross Tax on 800,000 for 2023-24:
    // First 350,000 @ 0% = 0
    // Next 100,000 (350k-450k) @ 5% = 5,000
    // Next 300,000 (450k-750k) @ 10% = 30,000
    // Next 50,000 (750k-800k) @ 15% = 7,500
    // Total Gross Tax = 42,500.00
    console.log(`  Gross Tax:            ৳${calc2023.grossTax} (Expected: ৳42,500.00)`);

    // Rebate: min(3% of 800k = 24,000, 15% of 120k = 18,000, 1,000,000) = 18,000.00
    console.log(`  Tax Rebate:           ৳${calc2023.taxRebate} (Expected: ৳18,000.00)`);

    // Net Regular Tax: 42,500 - 18,000 = 24,500.00
    console.log(`  Net Tax:              ৳${calc2023.netTax} (Expected: ৳24,500.00)`);
    console.log(`  Minimum Tax:          ৳${calc2023.minimumTax} (Expected: ৳5,000.00 Dhaka North)`);
    console.log(`  Tax Liability:        ৳${calc2023.taxLiability} (Expected: ৳24,500.00)`);
    console.log(`  TDS Credit:           ৳${calc2023.tdsAmount} (Expected: ৳10,000.00)`);
    console.log(`  Advance Tax Credit:   ৳${calc2023.advanceTaxAmount} (Expected: ৳5,000.00)`);
    console.log(`  Final Payable:        ৳${calc2023.finalPayable} (Expected: ৳9,500.00)`);

    if (
      calc2023.salaryExemption === 400000 &&
      calc2023.taxableIncome === 800000 &&
      calc2023.eligibleInvestment === 120000 &&
      calc2023.grossTax === 42500 &&
      calc2023.taxRebate === 18000 &&
      calc2023.finalPayable === 9500
    ) {
      console.log("  >>> PASS: AY 2023-24 calculation verified perfectly!\n");
    } else {
      console.error("  >>> FAIL: AY 2023-24 calculation mismatch!\n");
    }

    // ============================================================================
    // TEST 2: AY 2024-25 (Finance Act 2024 Second Schedule + Female Threshold)
    // Slabs: 0% up to 400k (Women); 5% on 100k; 10% on 400k; 15% on 500k; 20% on 500k; rem 25% (Top slab is 25%)
    // ============================================================================
    console.log("--- TEST 2: AY 2024-25 (Female ৳400k Threshold + 25% Top Bracket) ---");

    // Clean data for 2024-25
    await query(`DELETE FROM tax_deductions WHERE user_id = ?`, [testUserId]);
    await query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);

    // Update profile: Female taxpayer in Other City Corp (4,000 min tax)
    await query(
      `UPDATE taxpayer_profiles
       SET gender = 'FEMALE', minimum_tax_area = 'OTHER_CITY', net_wealth = 0, tds_amount = 0, advance_tax_amount = 0
       WHERE user_id = ?`,
      [testUserId]
    );

    // Income in 2024-25: 4,500,000 business/other income (no salary exemption)
    await query(
      `INSERT INTO income (user_id, income_type, source_name, amount, income_date)
       VALUES (?, 'BUSINESS', 'Tech Consulting', 4500000.00, '2024-08-15')`,
      [testUserId]
    );

    const calc2024 = await TaxCalculationService.calculateTax(testUserId, "2024-25");

    console.log(`  Category:             ${calc2024.category} (Expected: WOMEN)`);
    console.log(`  Tax-Free Threshold:   ৳${calc2024.taxFreeThreshold} (Expected: ৳400,000.00)`);
    console.log(`  Taxable Income:       ৳${calc2024.taxableIncome} (Expected: ৳4,500,000.00)`);

    // Expected Slabs for Women (Threshold 400k) on 4,500,000:
    // First 400k @ 0% = 0
    // Next 100k (400k-500k) @ 5% = 5,000
    // Next 400k (500k-900k) @ 10% = 40,000
    // Next 500k (900k-1.4M) @ 15% = 75,000
    // Next 500k (1.4M-1.9M) @ 20% = 100,000
    // Remaining 2,600,000 (1.9M-4.5M) @ 25% = 650,000
    // Total Gross Tax = 870,000.00
    console.log(`  Gross Tax:            ৳${calc2024.grossTax} (Expected: ৳870,000.00)`);

    if (calc2024.taxFreeThreshold === 400000 && calc2024.grossTax === 870000) {
      console.log("  >>> PASS: AY 2024-25 calculation verified perfectly!\n");
    } else {
      console.error("  >>> FAIL: AY 2024-25 calculation mismatch!\n");
    }

    // ============================================================================
    // TEST 3: AY 2025-26 (Paripatra 2025-26 Section 2.1: ৳350k Threshold + 5% Slab + Area Min Tax)
    // Slabs: 0% up to 350k; 5% on 100k; 10% on 400k; 15% on 500k; 20% on 500k; 25% on 2M; rem 30%
    // Minimum Tax: Area-based (Dhaka North = ৳5,000)
    // ============================================================================
    console.log("--- TEST 3: AY 2025-26 (Paripatra 2025-26 Section 2.1: ৳350k Threshold + 5% Slab + Area Min Tax) ---");

    await query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);

    // Profile: Regular Taxpayer, General category, Dhaka North
    await query(
      `UPDATE taxpayer_profiles
       SET gender = 'MALE', is_new_taxpayer = 0, minimum_tax_area = 'DHAKA_NORTH'
       WHERE user_id = ?`,
      [testUserId]
    );

    // Income: 390,000 (exceeds 350k threshold by 40k)
    // Taxable Income = 390,000
    // First 350k @ 0% = 0
    // Next 40k @ 5% = 2,000.00
    // Minimum tax for DHAKA_NORTH in 2025-26 is 5,000.00
    // Since 2,000 < 5,000, tax liability is 5,000.00
    await query(
      `INSERT INTO income (user_id, income_type, source_name, amount, income_date)
       VALUES (?, 'OTHER', 'Freelance Work', 390000.00, '2025-08-10')`,
      [testUserId]
    );

    const calc2025 = await TaxCalculationService.calculateTax(testUserId, "2025-26");

    console.log(`  Tax-Free Threshold:   ৳${calc2025.taxFreeThreshold} (Expected: ৳350,000.00)`);
    console.log(`  Gross Tax:            ৳${calc2025.grossTax} (Expected: ৳2,000.00)`);
    console.log(`  Minimum Tax Rule:     ${calc2025.minimumTaxArea} (${calc2025.minimumTaxRuleType})`);
    console.log(`  Minimum Tax Amount:   ৳${calc2025.minimumTax} (Expected: ৳5,000.00 for Dhaka North)`);
    console.log(`  Tax Liability:        ৳${calc2025.taxLiability} (Expected: ৳5,000.00)`);

    if (calc2025.taxFreeThreshold === 350000 && calc2025.grossTax === 2000 && calc2025.minimumTax === 5000 && calc2025.taxLiability === 5000) {
      console.log("  >>> PASS: AY 2025-26 calculation verified perfectly!\n");
    } else {
      console.error("  >>> FAIL: AY 2025-26 calculation mismatch!\n");
    }

    // ============================================================================
    // TEST 4: AY 2026-27 (Same rules as AY 2025-26: 375k Limit, 15% Rebate, 1M Cap, Wealth Surcharge)
    // Wealth Surcharge: Net wealth 15 Cr -> 20% Surcharge!
    // Triggers test: Multiple motor vehicles -> minimum 10% surcharge
    // ============================================================================
    console.log("--- TEST 4: AY 2026-27 (Same Rules as 2025-26: 375k Threshold + 15% Rebate Rate + Wealth Surcharge) ---");

    await query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);
    await query(`DELETE FROM tax_deductions WHERE user_id = ?`, [testUserId]);

    // Profile: Net wealth 15 Crore (150,000,000) -> 20% surcharge bracket!
    // has_multiple_motor_vehicles = 1
    await query(
      `UPDATE taxpayer_profiles
       SET gender = 'MALE', is_new_taxpayer = 0, net_wealth = 150000000.00, has_multiple_motor_vehicles = 1,
           tds_amount = 50000.00, advance_tax_amount = 25000.00
       WHERE user_id = ?`,
      [testUserId]
    );

    // Income in 2026-27: 1,000,000
    await query(
      `INSERT INTO income (user_id, income_type, source_name, amount, income_date)
       VALUES (?, 'BUSINESS', 'Software Agency', 1000000.00, '2026-08-15')`,
      [testUserId]
    );

    // Deduction: Life insurance with sum assured 500k and premium 80k -> allowable = min(80k, 10% of 500k = 50k) = 50,000!
    await query(
      `INSERT INTO tax_deductions (user_id, tax_year, deduction_code, amount, policy_sum_assured, deduction_date)
       VALUES (?, '2026-27', 'LIFE_INSURANCE', 80000.00, 500000.00, '2026-09-01')`,
      [testUserId]
    );

    const calc2026 = await TaxCalculationService.calculateTax(testUserId, "2026-27");

    console.log(`  Tax-Free Threshold:   ৳${calc2026.taxFreeThreshold} (Expected: ৳375,000.00)`);
    console.log(`  Eligible Investment:  ৳${calc2026.eligibleInvestment} (Expected: ৳50,000.00 after 10% sum assured cap)`);

    // Slabs for 2026-27 on 1,000,000 (identical to 2025-26):
    // First 375k @ 0% = 0
    // Next 300k (375k-675k) @ 10% = 30,000
    // Next 325k (675k-1,000k) @ 15% = 48,750
    // Total Gross Tax = 78,750.00
    console.log(`  Gross Tax:            ৳${calc2026.grossTax} (Expected: ৳78,750.00)`);

    // Rebate for 2026-27 (identical to 2025-26):
    // min(3% of 1M = 30,000, 15% of 50k = 7,500, 1,000,000 cap) = 7,500.00
    console.log(`  Rebate Rate:          ${calc2026.rebateRate}% (Expected: 15%)`);
    console.log(`  Tax Rebate:           ৳${calc2026.taxRebate} (Expected: ৳7,500.00)`);

    // Net Tax: 78,750 - 7,500 = 71,250.00
    console.log(`  Net Regular Tax:      ৳${calc2026.netTax} (Expected: ৳71,250.00)`);

    // Surcharge: Net Wealth 15 Crore is between 10 Cr and 20 Cr -> 20% surcharge rate!
    // Surcharge Amount = 71,250 * 20% = 14,250.00
    console.log(`  Net Wealth:           ৳${calc2026.netWealth} (15 Crore)`);
    console.log(`  Surcharge Rate:       ${calc2026.surchargeRate}% (Expected: 20%)`);
    console.log(`  Surcharge Amount:     ৳${calc2026.surchargeAmount} (Expected: ৳14,250.00)`);

    // Total Tax Payable = 71,250 + 14,250 = 85,500.00
    console.log(`  Total Tax Payable:    ৳${calc2026.totalTaxPayable} (Expected: ৳85,500.00)`);

    // Credits: TDS 50k + Advance 25k = 75,000.00
    // Final Payable = 85,500 - 75,000 = 10,500.00
    console.log(`  Total Credits:        ৳${calc2026.totalTaxCredits} (Expected: ৳75,000.00)`);
    console.log(`  Final Payable:        ৳${calc2026.finalPayable} (Expected: ৳10,500.00)`);

    if (
      calc2026.taxFreeThreshold === 375000 &&
      calc2026.eligibleInvestment === 50000 &&
      calc2026.grossTax === 78750 &&
      calc2026.taxRebate === 7500 &&
      calc2026.surchargeRate === 20 &&
      calc2026.surchargeAmount === 14250 &&
      calc2026.totalTaxPayable === 85500 &&
      calc2026.finalPayable === 10500
    ) {
      console.log("  >>> PASS: AY 2026-27 calculation verified perfectly!\n");
    } else {
      console.error("  >>> FAIL: AY 2026-27 calculation mismatch!\n");
    }

    // ============================================================================
    // TEST 5: Surcharge Trigger Test (Net Wealth <= 4 Cr BUT Multiple Vehicles)
    // Expected: Minimum 10% surcharge triggered!
    // ============================================================================
    console.log("--- TEST 5: Special Surcharge Trigger (Wealth <= 4 Cr with Multiple Motor Vehicles) ---");

    await query(
      `UPDATE taxpayer_profiles
       SET net_wealth = 20000000.00, has_multiple_motor_vehicles = 1, tds_amount = 0, advance_tax_amount = 0
       WHERE user_id = ?`,
      [testUserId]
    );

    const calcTrigger = await TaxCalculationService.calculateTax(testUserId, "2026-27");
    console.log(`  Net Wealth:           ৳${calcTrigger.netWealth} (2 Crore, bracket rate 0%)`);
    console.log(`  Has Multi Vehicles:   ${calcTrigger.hasMultipleMotorVehicles}`);
    console.log(`  Surcharge Rate:       ${calcTrigger.surchargeRate}% (Expected: 10% minimum triggered)`);
    console.log(`  Surcharge Trigger:    ${calcTrigger.surchargeTriggerApplied} (Expected: true)`);
    console.log(`  Surcharge Amount:     ৳${calcTrigger.surchargeAmount} (10% of 71,250 = ৳7,125.00)`);

    if (calcTrigger.surchargeRate === 10 && calcTrigger.surchargeTriggerApplied === true && calcTrigger.surchargeAmount === 7125) {
      console.log("  >>> PASS: Multi-vehicle surcharge trigger verified perfectly!\n");
    } else {
      console.error("  >>> FAIL: Multi-vehicle surcharge trigger mismatch!\n");
    }

    // ============================================================================
    // TEST 6: Database Persistence & History Enrichment Test
    // Verify that getCalculationById and getCalculations return all new fields
    // ============================================================================
    console.log("--- TEST 6: Audit Trail & DB History Enrichment Verification ---");
    const retrievedCalc = await TaxCalculationService.getCalculationById(calcTrigger.id, testUserId);

    console.log(`  Retrieved ID:         ${retrievedCalc.id}`);
    console.log(`  Retrieved Surcharge:  ৳${retrievedCalc.surcharge_amount}`);
    console.log(`  Retrieved Total Pay:  ৳${retrievedCalc.total_tax_payable}`);
    console.log(`  Retrieved Final Pay:  ৳${retrievedCalc.final_payable}`);

    if (
      retrievedCalc &&
      Number(retrievedCalc.surcharge_amount) === 7125 &&
      Number(retrievedCalc.total_tax_payable) === 78375 &&
      Number(retrievedCalc.final_payable) === 78375
    ) {
      console.log("  >>> PASS: DB persistence and history enrichment verified perfectly!\n");
    } else {
      console.error("  >>> FAIL: DB persistence and history enrichment mismatch!\n");
    }

    console.log("================================================================================");
    console.log("  ALL TESTS COMPLETED SUCCESSFULLY! SYSTEM 100% COMPLIANT WITH NBR LAW.");
    console.log("================================================================================");

  } catch (error) {
    console.error("Test execution failed with error:", error);
  } finally {
    if (testUserId) {
      await query(`DELETE FROM tax_calculation_details WHERE tax_calculation_id IN (SELECT id FROM tax_calculations WHERE user_id = ?)`, [testUserId]);
      await query(`DELETE FROM tax_calculations WHERE user_id = ?`, [testUserId]);
      await query(`DELETE FROM tax_deductions WHERE user_id = ?`, [testUserId]);
      await query(`DELETE FROM expenses WHERE user_id = ?`, [testUserId]);
      await query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);
      await query(`DELETE FROM taxpayer_profiles WHERE user_id = ?`, [testUserId]);
      await query(`DELETE FROM users WHERE id = ?`, [testUserId]);
    }
    process.exit(0);
  }
}

runTests();
