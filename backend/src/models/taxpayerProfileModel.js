const db = require("../database/query");

const TaxpayerProfileModel = {
 
  
  async createProfile(data) {
    const sql = `
            INSERT INTO taxpayer_profiles (
                user_id,
                date_of_birth,
                gender,
                minimum_tax_area,
                is_new_taxpayer,
                is_physically_challenged,
                disabled_child_dependents,
                is_freedom_fighter,
                is_july_warrior,
                net_wealth,
                has_multiple_motor_vehicles,
                has_large_house_property,
                tds_amount,
                advance_tax_amount
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    const values = [
      data.user_id,
      data.date_of_birth,
      data.gender,
      data.minimum_tax_area || "OTHER_AREA",
      data.is_new_taxpayer ? 1 : 0,
      data.is_physically_challenged ? 1 : 0,
      data.disabled_child_dependents || 0,
      data.is_freedom_fighter ? 1 : 0,
      data.is_july_warrior ? 1 : 0,
      Number(data.net_wealth || 0),
      data.has_multiple_motor_vehicles ? 1 : 0,
      data.has_large_house_property ? 1 : 0,
      Number(data.tds_amount || 0),
      Number(data.advance_tax_amount || 0),
    ];

    return await db.query(sql, values);
  },

  async getProfileByUserId(userId) {
    const sql = `
            SELECT
                id,
                user_id,
                date_of_birth,
                gender,
                minimum_tax_area,
                is_new_taxpayer,
                is_physically_challenged,
                disabled_child_dependents,
                is_freedom_fighter,
                is_july_warrior,
                net_wealth,
                has_multiple_motor_vehicles,
                has_large_house_property,
                tds_amount,
                advance_tax_amount,
                created_at,
                updated_at
            FROM taxpayer_profiles
            WHERE user_id = ?
            LIMIT 1
        `;

    return await db.query(sql, [userId]);
  },

  async updateProfile(userId, data) {
    const sql = `
            UPDATE taxpayer_profiles
            SET
                date_of_birth = ?,
                gender = ?,
                minimum_tax_area = ?,
                is_new_taxpayer = ?,
                is_physically_challenged = ?,
                disabled_child_dependents = ?,
                is_freedom_fighter = ?,
                is_july_warrior = ?,
                net_wealth = ?,
                has_multiple_motor_vehicles = ?,
                has_large_house_property = ?,
                tds_amount = ?,
                advance_tax_amount = ?
            WHERE user_id = ?
        `;

    const values = [
      data.date_of_birth,
      data.gender,
      data.minimum_tax_area || "OTHER_AREA",
      data.is_new_taxpayer ? 1 : 0,
      data.is_physically_challenged ? 1 : 0,
      data.disabled_child_dependents || 0,
      data.is_freedom_fighter ? 1 : 0,
      data.is_july_warrior ? 1 : 0,
      Number(data.net_wealth || 0),
      data.has_multiple_motor_vehicles ? 1 : 0,
      data.has_large_house_property ? 1 : 0,
      Number(data.tds_amount || 0),
      Number(data.advance_tax_amount || 0),
      userId,
    ];

    return await db.query(sql, values);
  },

 
  async profileExists(userId) {
    const sql = `
            SELECT
                id
            FROM taxpayer_profiles
            WHERE user_id = ?
            LIMIT 1
        `;

    const rows = await db.query(sql, [userId]);

    return rows.length > 0;
  },
};

module.exports = TaxpayerProfileModel;
