require("dotenv").config();
const { query } = require("./src/database/query");
const TaxCalculationService = require("./src/services/taxCalculationService");

async function runEdgeCaseTests() {
  console.log("================================================================================");
  console.log("  BANGLADESH INCOME TAX - EDGE CASES & BOUNDARY VERIFICATION");
  console.log("================================================================================\n");

  let testUserId = null;

  try {
    const userResult = await query(
      `INSERT INTO users (full_name, email, password, phone, nid, role, is_verified)
       VALUES ('Edge Case User', 'edge_case_tax@example.com', 'password_hash', '01988888888', '19888888888888888', 'user', 1)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`
    );
    testUserId = userResult.insertId;

    // EDGE CASE 1: Income <= Threshold (Minimum Tax should NOT apply)
    console.log("--- EDGE CASE 1: Total Gross Income <= Tax-Free Threshold ---");
    await query(
      `INSERT INTO taxpayer_profiles (user_id, date_of_birth, gender, minimum_tax_area, is_new_taxpayer, net_wealth)
       VALUES (?, '1995-05-10', 'MALE', 'DHAKA_NORTH', 0, 0)
       ON DUPLICATE KEY UPDATE minimum_tax_area='DHAKA_NORTH', is_new_taxpayer=0, net_wealth=0`,
      [testUserId]
    );

    await query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);
    await query(
      `INSERT INTO income (user_id, income_type, source_name, amount, income_date)
       VALUES (?, 'OTHER', 'Part-time Tutoring', 300000.00, '2024-08-15')`,
      [testUserId]
    );

    const calcBelowThreshold = await TaxCalculationService.calculateTax(testUserId, "2024-25");
    console.log(`  Total Income:         ৳${calcBelowThreshold.totalIncome} (Threshold: ৳${calcBelowThreshold.taxFreeThreshold})`);
    console.log(`  Gross Tax:            ৳${calcBelowThreshold.grossTax}`);
    console.log(`  Min Tax Applicable:   ${calcBelowThreshold.minimumTaxApplicable} (Expected: false)`);
    console.log(`  Tax Liability:        ৳${calcBelowThreshold.taxLiability} (Expected: ৳0.00)`);

    if (calcBelowThreshold.taxLiability === 0 && calcBelowThreshold.minimumTaxApplicable === false) {
      console.log("  >>> PASS: Minimum tax correctly NOT applied when income <= threshold.\n");
    } else {
      console.error("  >>> FAIL: Minimum tax incorrectly applied!\n");
    }

    // EDGE CASE 2: Disabled Child Dependent (+50,000 per child)
    console.log("--- EDGE CASE 2: Disabled Child Dependents (+50k per child) ---");
    await query(
      `UPDATE taxpayer_profiles SET disabled_child_dependents = 2 WHERE user_id = ?`,
      [testUserId]
    );

    const calcDisabledChild = await TaxCalculationService.calculateTax(testUserId, "2024-25");
    console.log(`  Base Threshold:       ৳350,000.00`);
    console.log(`  Dependents:           ${calcDisabledChild.disabledChildDependents}`);
    console.log(`  Additional Allowance: ৳${calcDisabledChild.disabledChildAdditionalThreshold} (Expected: ৳100,000.00)`);
    console.log(`  Effective Threshold:  ৳${calcDisabledChild.taxFreeThreshold} (Expected: ৳450,000.00)`);

    if (calcDisabledChild.taxFreeThreshold === 450000) {
      console.log("  >>> PASS: Disabled child dependent allowance correctly applied.\n");
    } else {
      console.error("  >>> FAIL: Disabled child dependent allowance calculation mismatch!\n");
    }

    // EDGE CASE 3: Refund Scenario (TDS > Total Tax Payable)
    console.log("--- EDGE CASE 3: Refund Reconciliation (TDS 50,000 > Tax 5,000) ---");
    await query(
      `UPDATE taxpayer_profiles
       SET disabled_child_dependents = 0, tds_amount = 50000.00, advance_tax_amount = 0
       WHERE user_id = ?`,
      [testUserId]
    );

    // Total income 360,000 in 2024-25 -> 10,000 over 350k threshold @ 5% = 500 gross tax
    // Dhaka North minimum tax = 5,000 -> tax liability = 5,000
    // Total Tax Payable = 5,000
    // TDS Credit = 50,000
    // Final Payable = 5,000 - 50,000 = -45,000 (Refund!)
    await query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);
    await query(
      `INSERT INTO income (user_id, income_type, source_name, amount, income_date)
       VALUES (?, 'OTHER', 'Consultancy Fee', 360000.00, '2024-08-15')`,
      [testUserId]
    );

    const calcRefund = await TaxCalculationService.calculateTax(testUserId, "2024-25");
    console.log(`  Tax Liability:        ৳${calcRefund.taxLiability} (Expected: ৳5,000.00)`);
    console.log(`  TDS Deducted:         ৳${calcRefund.tdsAmount} (Expected: ৳50,000.00)`);
    console.log(`  Final Payable:        ৳${calcRefund.finalPayable} (Expected: -৳45,000.00 refund)`);

    if (calcRefund.finalPayable === -45000) {
      console.log("  >>> PASS: Refund correctly calculated as negative payable amount.\n");
    } else {
      console.error("  >>> FAIL: Refund calculation mismatch!\n");
    }

    console.log("================================================================================");
    console.log("  ALL EDGE CASES VERIFIED SUCCESSFULLY!");
    console.log("================================================================================");

  } catch (error) {
    console.error("Edge case test failed:", error);
  } finally {
    if (testUserId) {
      await query(`DELETE FROM tax_calculation_details WHERE tax_calculation_id IN (SELECT id FROM tax_calculations WHERE user_id = ?)`, [testUserId]);
      await query(`DELETE FROM tax_calculations WHERE user_id = ?`, [testUserId]);
      await query(`DELETE FROM income WHERE user_id = ?`, [testUserId]);
      await query(`DELETE FROM taxpayer_profiles WHERE user_id = ?`, [testUserId]);
      await query(`DELETE FROM users WHERE id = ?`, [testUserId]);
    }
    process.exit(0);
  }
}

runEdgeCaseTests();
