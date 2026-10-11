const { query } = require("../database/query");

const IncomeModel = {
  // create income
  async create(incomeData) {
    const {
      user_id,
      income_type,
      source_name,
      amount,
      income_date,
      description,
    } = incomeData;

    const sql = `
      INSERT INTO income (
        user_id,
        income_type,
        source_name,
        amount,
        income_date,
        description
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
    `;

    const result = await query(sql, [
      user_id,
      income_type,
      source_name,
      amount,
      income_date,
      description || null,
    ]);

    return result;
  },

  // get all in come of a user

  async findByUserId(userId) {
    const sql = `
      SELECT
        id,
        user_id,
        income_type,
        source_name,
        amount,
        income_date,
        description,
        created_at,
        updated_at
      FROM income
      WHERE user_id = ?
      ORDER BY id DESC
    `;

    const rows = await query(sql, [userId]);

    return rows;
  },

  // get one income

  async findById(incomeId) {
    const sql = `
      SELECT
        id,
        user_id,
        income_type,
        source_name,
        amount,
        income_date,
        description,
        created_at,
        updated_at
      FROM income
      WHERE id = ?
      LIMIT 1
    `;

    const rows = await query(sql, [incomeId]);

    return rows[0];
  },

 
  // update income
 

  async update(incomeId, incomeData) {
    const sql = `
      UPDATE income
      SET
        income_type = ?,
        source_name = ?,
        amount = ?,
        income_date = ?,
        description = ?
      WHERE id = ?
    `;

    const result = await query(sql, [
      incomeData.income_type,
      incomeData.source_name,
      incomeData.amount,
      incomeData.income_date,
      incomeData.description,
      incomeId,
    ]);

    return result;
  },

  
  // delete income


  async delete(incomeId) {
    const sql = `
      DELETE FROM income
      WHERE id = ?
    `;

    const result = await query(sql, [incomeId]);

    return result;
  },

 
  // get total income
 

  async getTotalByUserId(userId) {
    const sql = `
      SELECT
        COALESCE(SUM(amount), 0) AS total_income
      FROM income
      WHERE user_id = ?
    `;

    const rows = await query(sql, [userId]);

    return rows[0];
  },

  
  // get total income by date
 

  async getTotalIncomeByUserAndDateRange(userId, startDate, endDate) {
    const sql = `
      SELECT
        COALESCE(SUM(amount), 0) AS total_income
      FROM income
      WHERE user_id = ?
      AND income_date BETWEEN ? AND ?
    `;

    const rows = await query(sql, [userId, startDate, endDate]);

    return rows[0];
  },
};

module.exports = IncomeModel;
