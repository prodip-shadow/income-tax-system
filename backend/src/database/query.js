// query helper

const pool = require("./connection");

const query = async (sql, params = []) => {
    const sanitizedParams = params.map((p) => (p === undefined ? null : p));
    const [rows] = await pool.execute(sql, sanitizedParams);

    return rows;
};

// get connection for transaction
const getConnection = async () => {
    return await pool.getConnection();
};

module.exports = {
    query,
    getConnection
};