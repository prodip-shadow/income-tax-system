require('dotenv').config();
const { query } = require('../src/database/query');

async function inspectTables() {
  const years = ['2026-27', '2025-26', '2024-25', '2023-24'];
  for (const yr of years) {
    const slabs = await query('SELECT minimum_income, maximum_income, tax_rate FROM tax_rules WHERE tax_year = ? AND status = "ACTIVE" ORDER BY minimum_income ASC', [yr]);
    const thresh = await query('SELECT category, tax_free_threshold FROM tax_thresholds WHERE tax_year = ? AND status = "ACTIVE" ORDER BY tax_free_threshold ASC', [yr]);
    const sal = await query('SELECT calculation_type, exemption_percentage, max_exemption_amount FROM salary_exemption_rules WHERE tax_year = ? AND status = "ACTIVE"', [yr]);
    const minTax = await query('SELECT rule_type, area_code, area_name, minimum_tax_amount FROM minimum_tax_rules WHERE tax_year = ? AND status = "ACTIVE"', [yr]);
    const rebate = await query('SELECT rule_code, rule_name, calculation_type, rate, fixed_amount FROM tax_rebate_rules WHERE tax_year = ? AND status = "ACTIVE"', [yr]);
    const surcharge = await query('SELECT rule_name, minimum_wealth, maximum_wealth, surcharge_rate FROM surcharge_rules WHERE tax_year = ? AND status = "ACTIVE" ORDER BY minimum_wealth ASC', [yr]);
    console.log('=== YEAR: ' + yr + ' ===');
    console.log('  Slabs count: ' + slabs.length);
    console.log('  Thresholds count: ' + thresh.length);
    console.log('  Salary Exemption: ', sal[0]);
    console.log('  Min Tax count: ' + minTax.length);
    console.log('  Rebate: ', rebate[0]);
    console.log('  Surcharge count: ' + surcharge.length);
  }
}
inspectTables().catch(console.error);
