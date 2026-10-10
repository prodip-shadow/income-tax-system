const MinimumTaxRuleModel = require("../models/minimumTaxRuleModel");

const MinimumTaxRuleController = {

    // get active minimum tax rules by tax year
    // get /api/minimum-tax-rules/:taxyear

    async getRulesByTaxYear(req, res) {

        try {

            const { taxYear } = req.params;

            // validate tax year format
            if (!/^\d{4}-\d{2}$/.test(taxYear)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid tax year format. Expected YYYY-YY."
                });

            }

            const rules =
                await MinimumTaxRuleModel.findActiveRulesByTaxYear(
                    taxYear
                );

            return res.status(200).json({
                success: true,
                data: rules
            });

        } catch (error) {

            console.error(
                "Get minimum tax rules error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch minimum tax rules."
            });
        }
    },


    // get one active rule by area code
    async getRuleByAreaCode(req, res) {
        try {
            const { taxYear, areaCode } = req.params;

            if (!/^\d{4}-\d{2}$/.test(taxYear)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid tax year format. Expected YYYY-YY."
                });
            }

            if (!areaCode || areaCode.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Area code is required."
                });
            }

            const rule = await MinimumTaxRuleModel.findByAreaCode(
                taxYear,
                areaCode.trim().toUpperCase()
            );

            if (!rule) {
                return res.status(404).json({
                    success: false,
                    message: "No active minimum tax rule found for this area."
                });
            }

            return res.status(200).json({
                success: true,
                data: rule
            });
        } catch (error) {
            console.error("Get minimum tax rule error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch minimum tax rule."
            });
        }
    },

    // admin: get all minimum tax rules with filters
    async getAllRules(req, res) {
        try {
            const rules = await MinimumTaxRuleModel.getAllRules(req.query || {});
            return res.status(200).json({
                success: true,
                data: rules
            });
        } catch (error) {
            console.error("Get all minimum tax rules error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch minimum tax rules."
            });
        }
    },

    // admin: get rule by id
    async getRuleById(req, res) {
        try {
            const rule = await MinimumTaxRuleModel.getRuleById(req.params.id);
            if (!rule) {
                return res.status(404).json({
                    success: false,
                    message: "Minimum tax rule not found."
                });
            }
            return res.status(200).json({
                success: true,
                data: rule
            });
        } catch (error) {
            console.error("Get minimum tax rule by id error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch rule."
            });
        }
    },

    // admin: create minimum tax rule
    async createRule(req, res) {
        try {
            const { tax_year, rule_type, area_code, area_name, minimum_tax_amount, effective_from, effective_to } = req.body;

            if (!tax_year || !area_code || !area_name || minimum_tax_amount === undefined || !effective_from) {
                return res.status(400).json({
                    success: false,
                    message: "tax_year, area_code, area_name, minimum_tax_amount, and effective_from are required."
                });
            }

            const result = await MinimumTaxRuleModel.createRule(req.body);
            return res.status(201).json({
                success: true,
                message: "Minimum tax rule created successfully.",
                data: { id: result.insertId, ...req.body }
            });
        } catch (error) {
            console.error("Create minimum tax rule error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to create minimum tax rule."
            });
        }
    },

    // admin: update minimum tax rule
    async updateRule(req, res) {
        try {
            const { id } = req.params;
            const existing = await MinimumTaxRuleModel.getRuleById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: "Minimum tax rule not found."
                });
            }

            await MinimumTaxRuleModel.updateRule(id, req.body);
            const updated = await MinimumTaxRuleModel.getRuleById(id);

            return res.status(200).json({
                success: true,
                message: "Minimum tax rule updated successfully.",
                data: updated
            });
        } catch (error) {
            console.error("Update minimum tax rule error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to update minimum tax rule."
            });
        }
    },

    // admin: toggle rule status
    async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid status (ACTIVE or INACTIVE) is required."
                });
            }

            await MinimumTaxRuleModel.toggleStatus(id, status);
            return res.status(200).json({
                success: true,
                message: `Minimum tax rule status updated to ${status}.`
            });
        } catch (error) {
            console.error("Toggle minimum tax rule status error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update status."
            });
        }
    },

    // admin: delete rule
    async deleteRule(req, res) {
        try {
            const { id } = req.params;
            await MinimumTaxRuleModel.deleteRule(id);
            return res.status(200).json({
                success: true,
                message: "Minimum tax rule deleted successfully."
            });
        } catch (error) {
            console.error("Delete minimum tax rule error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete minimum tax rule."
            });
        }
    },

    // admin: get available tax years
    async getAvailableTaxYears(req, res) {
        try {
            const years = await MinimumTaxRuleModel.getAvailableTaxYears();
            return res.status(200).json({
                success: true,
                data: years
            });
        } catch (error) {
            console.error("Get available tax years error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch tax years."
            });
        }
    }
};

module.exports = MinimumTaxRuleController;