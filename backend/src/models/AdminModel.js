const { query } = require("../database/query");
const pool = require("../database/connection");

const AdminModel = {
  async getDashboardStats() {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM income) AS total_income_records,
        (SELECT COUNT(*) FROM expenses) AS total_expense_records,
        (SELECT COUNT(*) FROM tax_calculations) AS total_tax_calculations
    `;

    const rows = await query(sql);

    return rows[0];
  },

  async getAllUsers() {
    const sql = `
      SELECT
        id,
        full_name,
        email,
        phone,
        nid,
        role,
        is_verified,
        created_at,
        updated_at
      FROM users
      ORDER BY id DESC
    `;

    return await query(sql);
  },

  async getUserById(id) {
    const sql = `
      SELECT
        id,
        full_name,
        email,
        phone,
        nid,
        role,
        is_verified,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `;

    const rows = await query(sql, [id]);

    return rows[0] || null;
  },

  async updateUserRole(id, role) {
    const sql = `
      UPDATE users
      SET
        role = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    return await query(sql, [role, id]);
  },

  async deleteUser(userId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        `
          DELETE FROM tax_deductions
          WHERE user_id = ?
        `,
        [userId],
      );

      await connection.query(
        `
          DELETE FROM tax_calculations
          WHERE user_id = ?
        `,
        [userId],
      );

      const [result] = await connection.query(
        `
          DELETE FROM users
          WHERE id = ?
        `,
        [userId],
      );

      if (result.affectedRows === 0) {
        throw new Error("User not found.");
      }

      await connection.commit();

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = AdminModel;