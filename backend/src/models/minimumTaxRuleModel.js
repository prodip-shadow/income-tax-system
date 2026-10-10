const db = require("../database/query");

const MinimumTaxRuleModel = {

    // get all active minimum tax rules by tax year
    async findActiveRulesByTaxYear(taxYear) {
        const sql = `
            SELECT
                id,
                tax_year,
                rule_type,
                area_code,
                area_name,
                minimum_tax_amount,
                status,
                effective_from,
                effective_to,
                created_at,
                updated_at
            FROM minimum_tax_rules
            WHERE tax_year = ?
              AND status = 'ACTIVE'
            ORDER BY id ASC
        `;

        return await db.query(sql, [taxYear]);
    },

    // get effective minimum tax rule based on tax year and taxpayer profile
    // for current/new tax years (2025-26, 2026-27): taxpayer-type based (NEW_TAXPAYER = 1000, REGULAR_TAXPAYER = 5000)
    // for older tax years (2024-25 and earlier): area based (DHAKA/CHATTOGRAM = 5000, OTHER_CITY = 4000, POURASHAVA = 3000)
    async findEffectiveRule(taxYear, profile = {}) {
        // 1. Check if TAXPAYER_TYPE rules exist for this tax year
        const taxpayerTypeCode = Number(profile?.is_new_taxpayer) === 1 ? "NEW_TAXPAYER" : "REGULAR_TAXPAYER";

        const taxpayerTypeRows = await db.query(
            `
            SELECT
                id,
                tax_year,
                rule_type,
                area_code,
                area_name,
                minimum_tax_amount,
                status,
                effective_from,
                effective_to
            FROM minimum_tax_rules
            WHERE tax_year = ?
              AND rule_type = 'TAXPAYER_TYPE'
              AND area_code = ?
              AND status = 'ACTIVE'
            LIMIT 1
            `,
            [taxYear, taxpayerTypeCode]
        );

        if (taxpayerTypeRows.length > 0) {
            return taxpayerTypeRows[0];
        }

        // 2. If no TAXPAYER_TYPE rules found, fall back to AREA_BASED rules
        const areaCode = String(profile?.minimum_tax_area || "DHAKA_NORTH").trim().toUpperCase();
        const areaRows = await db.query(
            `
            SELECT
                id,
                tax_year,
                rule_type,
                area_code,
                area_name,
                minimum_tax_amount,
                status,
                effective_from,
                effective_to
            FROM minimum_tax_rules
            WHERE tax_year = ?
              AND area_code = ?
              AND status = 'ACTIVE'
            LIMIT 1
            `,
            [taxYear, areaCode]
        );

        if (areaRows.length > 0) {
            return areaRows[0];
        }

        // 3. Fallback to any active rule for this tax year
        const fallbackRows = await db.query(
            `
            SELECT
                id,
                tax_year,
                rule_type,
                area_code,
                area_name,
                minimum_tax_amount,
                status,
                effective_from,
                effective_to
            FROM minimum_tax_rules
            WHERE tax_year = ?
              AND status = 'ACTIVE'
            ORDER BY id ASC
            LIMIT 1
            `,
            [taxYear]
        );

        return fallbackRows[0] || null;
    },


    // get one active rule by area code

    async findByAreaCode(taxYear, areaCode) {

        const sql = `
            SELECT
                id,
                tax_year,
                area_code,
                area_name,
                minimum_tax_amount,
                status,
                effective_from,
                effective_to,
                created_at,
                updated_at
            FROM minimum_tax_rules
            WHERE tax_year = ?
              AND area_code = ?
              AND status = 'ACTIVE'
            LIMIT 1
        `;

        const rows = await db.query(sql, [
            taxYear,
            areaCode
        ]);

        return rows[0] || null;
    },


    // check whether area exists for tax year
    async existsByAreaCode(taxYear, areaCode) {
        const sql = `
            SELECT id
            FROM minimum_tax_rules
            WHERE tax_year = ?
              AND area_code = ?
              AND status = 'ACTIVE'
            LIMIT 1
        `;

        const rows = await db.query(sql, [taxYear, areaCode]);
        return rows.length > 0;
    },

    // admin: get all rules with optional filters
    async getAllRules(filters = {}) {
        let sql = `
            SELECT
                id,
                tax_year,
                rule_type,
                area_code,
                area_name,
                minimum_tax_amount,
                status,
                effective_from,
                effective_to,
                created_at,
                updated_at
            FROM minimum_tax_rules
            WHERE 1 = 1
        `;

        const values = [];

        if (filters.tax_year) {
            sql += " AND tax_year = ?";
            values.push(filters.tax_year);
        }

        if (filters.rule_type) {
            sql += " AND rule_type = ?";
            values.push(filters.rule_type);
        }

        if (filters.status) {
            sql += " AND status = ?";
            values.push(filters.status);
        }

        if (filters.search) {
            sql += " AND (area_code LIKE ? OR area_name LIKE ?)";
            const term = `%${filters.search}%`;
            values.push(term, term);
        }

        sql += " ORDER BY tax_year DESC, rule_type ASC, id ASC";

        return await db.query(sql, values);
    },

    // admin: get rule by id
    async getRuleById(id) {
        const sql = `
            SELECT
                id,
                tax_year,
                rule_type,
                area_code,
                area_name,
                minimum_tax_amount,
                status,
                effective_from,
                effective_to,
                created_at,
                updated_at
            FROM minimum_tax_rules
            WHERE id = ?
            LIMIT 1
        `;

        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    },

    // admin: create minimum tax rule
    async createRule(data) {
        const sql = `
            INSERT INTO minimum_tax_rules (
                tax_year,
                rule_type,
                area_code,
                area_name,
                minimum_tax_amount,
                status,
                effective_from,
                effective_to
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.tax_year,
            data.rule_type || "TAXPAYER_TYPE",
            data.area_code,
            data.area_name,
            data.minimum_tax_amount,
            data.status || "ACTIVE",
            data.effective_from,
            data.effective_to || null
        ];

        return await db.query(sql, values);
    },

    // admin: update rule
    async updateRule(id, data) {
        const sql = `
            UPDATE minimum_tax_rules
            SET
                tax_year = ?,
                rule_type = ?,
                area_code = ?,
                area_name = ?,
                minimum_tax_amount = ?,
                status = ?,
                effective_from = ?,
                effective_to = ?
            WHERE id = ?
        `;

        const values = [
            data.tax_year,
            data.rule_type || "TAXPAYER_TYPE",
            data.area_code,
            data.area_name,
            data.minimum_tax_amount,
            data.status || "ACTIVE",
            data.effective_from,
            data.effective_to || null,
            id
        ];

        return await db.query(sql, values);
    },

    // admin: toggle status
    async toggleStatus(id, status) {
        const sql = `
            UPDATE minimum_tax_rules
            SET status = ?
            WHERE id = ?
        `;

        return await db.query(sql, [status, id]);
    },

    // admin: delete rule
    async deleteRule(id) {
        const sql = `
            DELETE FROM minimum_tax_rules
            WHERE id = ?
        `;

        return await db.query(sql, [id]);
    },

    // admin: get available tax years
    async getAvailableTaxYears() {
        const sql = `
            SELECT DISTINCT tax_year
            FROM minimum_tax_rules
            ORDER BY tax_year DESC
        `;

        const rows = await db.query(sql);
        return rows.map((r) => r.tax_year);
    }
};

module.exports = MinimumTaxRuleModel;