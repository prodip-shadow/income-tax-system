const { query } = require("../database/query");

class UserModel {
  async findByEmail(email) {
    const sql = `
            SELECT*
            FROM users
            WHERE email = ?
            LIMIT 1
        `;

    const users = await query(sql, [email]);

    return users[0] || null;
  }

  async findByphone(phone) {
    const sql = `
        SELECT *
        FROM users
        WHERE phone = ?
        LIMIT 1
    `;
    const user = await query(sql, [phone]);
    return user[0] || null;
  }

  async findByNid(nid) {
    const sql = `
        SELECT *
        FROM users
        WHERE nid = ?
        LIMIT 1
    `;
    const user = await query(sql, [nid]);
    return user[0] || null;
  }

  async create(userData) {
    const sql = `
        INSERT INTO users(
        full_name,
        email,
        password,
        phone,
        nid
    )
        VALUES(
        ?,
        ?,
        ?,
        ?,
        ?
        )
        `;

    const result = await query(sql, [
      userData.full_name,
      userData.email,
      userData.password,
      userData.phone,
      userData.nid,
    ]);

    return result;
  }

  async findById(id) {
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

    const users = await query(sql, [id]);

    return users[0] || null;
  }
}

module.exports = new UserModel();
