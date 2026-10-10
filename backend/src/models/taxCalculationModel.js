const db = require("../database/query");

const TaxCalculationModel = {
  // create tax calculation

  async createCalculation(data) {
    const sql = `
            INSERT INTO tax_calculations (
                user_id,
                tax_year,
                category,
                total_income,
                total_deduction,
                taxable_income,
                eligible_investment,
                gross_tax,
                tax_rebate,
                tax_liability,
                salary_income,
                salary_exemption,
                net_tax,
                minimum_tax,
                net_wealth,
                surcharge_rate,
                surcharge_amount,
                total_tax_payable,
                tds_amount,
                advance_tax_amount,
                final_payable
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    const values = [
      data.user_id,
      data.tax_year,
      data.category,
      data.total_income,
      data.total_deduction,
      data.taxable_income,
      data.eligible_investment,
      data.gross_tax,
      data.tax_rebate,
      data.tax_liability,
      data.salary_income || 0,
      data.salary_exemption || 0,
      data.net_tax || 0,
      data.minimum_tax || 0,
      data.net_wealth || 0,
      data.surcharge_rate || 0,
      data.surcharge_amount || 0,
      data.total_tax_payable || 0,
      data.tds_amount || 0,
      data.advance_tax_amount || 0,
      data.final_payable || 0,
    ];

    return await db.query(sql, values);
  },

  // get all calculations of user

  async getCalculationsByUserId(userId) {
    const sql = `
            SELECT
                id,
                user_id,
                tax_year,
                category,
                total_income,
                total_deduction,
                taxable_income,
                eligible_investment,
                gross_tax,
                tax_rebate,
                tax_liability,
                salary_income,
                salary_exemption,
                net_tax,
                minimum_tax,
                net_wealth,
                surcharge_rate,
                surcharge_amount,
                total_tax_payable,
                tds_amount,
                advance_tax_amount,
                final_payable,
                calculated_at,
                created_at,
                updated_at
            FROM tax_calculations
            WHERE user_id = ?
            ORDER BY calculated_at DESC, id DESC
        `;

    return await db.query(sql, [userId]);
  },

  // get single calculation

  async getCalculationById(id, userId) {
    const sql = `
            SELECT
                id,
                user_id,
                tax_year,
                category,
                total_income,
                total_deduction,
                taxable_income,
                eligible_investment,
                gross_tax,
                tax_rebate,
                tax_liability,
                salary_income,
                salary_exemption,
                net_tax,
                minimum_tax,
                net_wealth,
                surcharge_rate,
                surcharge_amount,
                total_tax_payable,
                tds_amount,
                advance_tax_amount,
                final_payable,
                calculated_at,
                created_at,
                updated_at
            FROM tax_calculations
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
        `;

    const rows = await db.query(sql, [id, userId]);

    return rows[0] || null;
  },

  // delete single calculation
  async deleteCalculation(id, userId) {
    const sql = `
      DELETE FROM tax_calculations
      WHERE id = ? AND user_id = ?
    `;

    return await db.query(sql, [id, userId]);
  },
};

// export

module.exports = TaxCalculationModel;