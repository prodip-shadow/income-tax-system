require('dotenv').config();
const { query } = require('../src/database/query');
const TaxCalculationService = require('../src/services/taxCalculationService');

async function verifyCalculations() {
  const user = await query('SELECT id FROM users WHERE email = ?', ['sohag@gmail.com']);
  const userId = user[0]?.id;

  const testYears = ['2023-24', '2024-25', '2025-26', '2026-27'];
  console.log('Testing calculations for user', userId);

  for (const year of testYears) {
    const res = await TaxCalculationService.calculateTax(userId, year);
    console.log(
      'AY: ' + year +
      ' | Salary Income: ' + res.salaryIncome +
      ' | Salary Exemption: ' + res.salaryExemption +
      ' | Gross Income: ' + res.totalIncome +
      ' | Net Taxable: ' + res.taxableIncome +
      ' | Slabs: ' + res.details.length +
      ' | Gross Tax: ' + res.grossTax
    );
  }
}

verifyCalculations().catch(console.error);
