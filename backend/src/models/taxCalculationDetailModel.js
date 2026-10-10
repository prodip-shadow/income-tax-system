const db = require("../database/query");

const TaxCalculationDetailModel = {

    // create one tax calculation detail
    async createDetail(data) {

        const sql = `
            INSERT INTO tax_calculation_details (
                tax_calculation_id,
                tax_rule_id,
                slab_order,
                minimum_income,
                maximum_income,
                tax_rate,
                taxable_amount,
                calculated_tax
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.tax_calculation_id,
            data.tax_rule_id,
            data.slab_order,
            data.minimum_income,
            data.maximum_income,
            data.tax_rate,
            data.taxable_amount,
            data.calculated_tax
        ];

        return await db.query(sql, values);
    },


    // get all details of one calculation
    async getDetailsByCalculationId(calculationId) {

        const sql = `
            SELECT
                id,
                tax_calculation_id,
                tax_rule_id,
                slab_order,
                minimum_income,
                maximum_income,
                tax_rate,
                taxable_amount,
                calculated_tax,
                created_at
            FROM tax_calculation_details
            WHERE tax_calculation_id = ?
            ORDER BY slab_order ASC
        `;

        return await db.query(sql, [calculationId]);
    },


    // get one detail
    async getDetailById(id, calculationId) {

        const sql = `
            SELECT
                id,
                tax_calculation_id,
                tax_rule_id,
                slab_order,
                minimum_income,
                maximum_income,
                tax_rate,
                taxable_amount,
                calculated_tax,
                created_at
            FROM tax_calculation_details
            WHERE id = ?
            AND tax_calculation_id = ?
            LIMIT 1
        `;

        return await db.query(sql, [id, calculationId]);
    }

};

module.exports = TaxCalculationDetailModel;