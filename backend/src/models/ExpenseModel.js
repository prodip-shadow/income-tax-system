const { query } = require("../database/query");

const ExpenseModel = {

    // find expense types

    async findExpenseTypes(category = null) {

        let sql = `
            SELECT
                id,
                expense_code,
                expense_name,
                expense_category,
                description
            FROM expense_types
            WHERE status = 'ACTIVE'
              AND effective_from <= CURDATE()
              AND (
                    effective_to IS NULL
                    OR effective_to >= CURDATE()
              )
        `;

        const params = [];

        if (category) {
            sql += `
                AND expense_category = ?
            `;

            params.push(category);
        }

        sql += `
            ORDER BY
                expense_category ASC,
                expense_name ASC
        `;

        return await query(sql, params);
    },


    // find single expense type

    async findExpenseTypeById(expenseTypeId) {

        const sql = `
            SELECT
                id,
                expense_code,
                expense_name,
                expense_category,
                description
            FROM expense_types
            WHERE id = ?
              AND status = 'ACTIVE'
              AND effective_from <= CURDATE()
              AND (
                    effective_to IS NULL
                    OR effective_to >= CURDATE()
              )
            LIMIT 1
        `;

        const rows = await query(sql, [
            expenseTypeId,
        ]);

        return rows[0];
    },


    // create expense

    async create(expenseData) {

        const {
            user_id,
            expense_type_id,
            is_tax_deductible,
            description,
            amount,
            expense_date,
        } = expenseData;

         // expense_type এবং expense_category master table থেকে automatically নেওয়া হচ্ছে।

        const sql = `
            INSERT INTO expenses (
                user_id,
                expense_type_id,
                expense_type,
                expense_category,
                is_tax_deductible,
                description,
                amount,
                expense_date
            )

            SELECT
                ?,
                et.id,
                et.expense_name,
                et.expense_category,
                ?,
                ?,
                ?,
                ?

            FROM expense_types et

            WHERE et.id = ?

              AND et.status = 'ACTIVE'

              AND et.effective_from <= CURDATE()

              AND (
                    et.effective_to IS NULL
                    OR et.effective_to >= CURDATE()
              )
        `;

        return await query(sql, [
            user_id,
            is_tax_deductible,
            description,
            amount,
            expense_date,
            expense_type_id,
        ]);
    },


    // find all expenses of user

    async findByUserId(userId) {

        const sql = `
            SELECT
                e.id,
                e.user_id,

                e.expense_type_id,

                et.expense_code,
                et.expense_name,
                et.expense_category,

                e.is_tax_deductible,
                e.description,
                e.amount,
                e.expense_date,
                e.created_at,
                e.updated_at

            FROM expenses e

            INNER JOIN expense_types et
                ON e.expense_type_id = et.id

            WHERE e.user_id = ?

            ORDER BY
                e.id DESC
        `;

        return await query(sql, [
            userId,
        ]);
    },


    // find expense by id

    async findById(expenseId) {

        const sql = `
            SELECT
                e.id,
                e.user_id,

                e.expense_type_id,

                et.expense_code,
                et.expense_name,
                et.expense_category,

                e.is_tax_deductible,
                e.description,
                e.amount,
                e.expense_date,
                e.created_at,
                e.updated_at

            FROM expenses e

            INNER JOIN expense_types et
                ON e.expense_type_id = et.id

            WHERE e.id = ?
        `;

        const rows = await query(sql, [
            expenseId,
        ]);

        return rows[0];
    },


    // update expense

    async update(expenseId, expenseData) {

        const {
            expense_type_id,
            is_tax_deductible,
            description,
            amount,
            expense_date,
        } = expenseData;

        const sql = `
            UPDATE expenses e

            INNER JOIN expense_types et
                ON et.id = ?
               AND et.status = 'ACTIVE'
               AND et.effective_from <= CURDATE()
               AND (
                    et.effective_to IS NULL
                    OR et.effective_to >= CURDATE()
               )

            SET
                e.expense_type_id = et.id,
                e.expense_type = et.expense_name,
                e.expense_category = et.expense_category,
                e.is_tax_deductible = ?,
                e.description = ?,
                e.amount = ?,
                e.expense_date = ?

            WHERE e.id = ?
        `;

        return await query(sql, [
            expense_type_id,
            is_tax_deductible,
            description,
            amount,
            expense_date,
            expenseId,
        ]);
    },


    // delete expense

    async delete(expenseId) {

        const sql = `
            DELETE FROM expenses
            WHERE id = ?
        `;

        return await query(sql, [
            expenseId,
        ]);
    },


    // total expense of user

    async getTotalByUserId(userId) {

        const sql = `
            SELECT
                COALESCE(
                    SUM(amount),
                    0
                ) AS total_expense

            FROM expenses

            WHERE user_id = ?
        `;

        const rows = await query(sql, [
            userId,
        ]);

        return rows[0];
    },


    // allowable business expense

    async getAllowableBusinessExpense(
        userId,
        startDate,
        endDate
    ) {

        const sql = `
            SELECT
                COALESCE(
                    SUM(e.amount),
                    0
                ) AS allowable_business_expense

            FROM expenses e

            INNER JOIN expense_types et
                ON e.expense_type_id = et.id

            WHERE e.user_id = ?

              AND et.expense_category = 'BUSINESS'

              AND e.is_tax_deductible = 1

              AND e.expense_date BETWEEN ? AND ?
        `;

        const rows = await query(sql, [
            userId,
            startDate,
            endDate,
        ]);

        return rows[0];
    },
};


module.exports = ExpenseModel;