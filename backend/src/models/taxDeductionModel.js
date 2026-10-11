const db = require("../database/query");

const TaxDeductionModel = {

    // create tax deduction

    async create(data) {

        const sql = `
            INSERT INTO tax_deductions (
                user_id,
                tax_year,
                deduction_code,
                amount,
                policy_sum_assured,
                description,
                deduction_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.user_id,
            data.tax_year,
            data.deduction_code,
            data.amount,
            data.policy_sum_assured ? Number(data.policy_sum_assured) : null,
            data.description ?? null,
            data.deduction_date
        ];

        return await db.query(sql, values);
    },


    // get all deductions of user

    async findByUserId(userId) {

        const sql = `
            SELECT
                id,
                user_id,
                tax_year,
                deduction_code,
                amount,
                policy_sum_assured,
                description,
                deduction_date,
                created_at,
                updated_at
            FROM tax_deductions
            WHERE user_id = ?
            ORDER BY id DESC
        `;

        return await db.query(sql, [userId]);
    },


    // get deductions by user + tax year

    async findByUserIdAndTaxYear(
        userId,
        taxYear
    ) {

        const sql = `
            SELECT
                id,
                user_id,
                tax_year,
                deduction_code,
                amount,
                policy_sum_assured,
                description,
                deduction_date,
                created_at,
                updated_at
            FROM tax_deductions
            WHERE user_id = ?
              AND tax_year = ?
            ORDER BY id DESC
        `;

        return await db.query(
            sql,
            [
                userId,
                taxYear
            ]
        );
    },


    // get single deduction

    async findById(id) {

        const sql = `
            SELECT
                id,
                user_id,
                tax_year,
                deduction_code,
                amount,
                policy_sum_assured,
                description,
                deduction_date,
                created_at,
                updated_at
            FROM tax_deductions
            WHERE id = ?
            LIMIT 1
        `;

        const rows =
            await db.query(
                sql,
                [id]
            );

        return rows[0];
    },


    // update tax deduction

    async update(id, data) {

        const sql = `
            UPDATE tax_deductions
            SET
                tax_year = ?,
                deduction_code = ?,
                amount = ?,
                policy_sum_assured = ?,
                description = ?,
                deduction_date = ?
            WHERE id = ?
        `;

        const values = [
            data.tax_year,
            data.deduction_code,
            data.amount,
            data.policy_sum_assured ? Number(data.policy_sum_assured) : null,
            data.description ?? null,
            data.deduction_date,
            id
        ];

        return await db.query(
            sql,
            values
        );
    },


    // delete tax deduction

    async delete(id) {

        const sql = `
            DELETE FROM tax_deductions
            WHERE id = ?
        `;

        return await db.query(
            sql,
            [id]
        );
    },


    // get total deduction
    // user + tax year

    async getTotalByUserAndTaxYear(
        userId,
        taxYear
    ) {

        const sql = `
            SELECT
                COALESCE(
                    SUM(amount),
                    0
                ) AS total_deduction
            FROM tax_deductions
            WHERE user_id = ?
              AND tax_year = ?
        `;

        const rows =
            await db.query(
                sql,
                [
                    userId,
                    taxYear
                ]
            );

        return Number(
            rows[0].total_deduction
        );
    }

};


// export

module.exports = TaxDeductionModel;