const SalaryExemptionRuleModel = require("../models/salaryExemptionRuleModel");

const SalaryExemptionRuleController = {
  // Get active rule by tax year
  async getActiveRule(req, res) {
    try {
      const { taxYear } = req.params;
      const rule = await SalaryExemptionRuleModel.getActiveRuleByTaxYear(taxYear);
      return res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      console.error("Get active salary exemption rule error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch salary exemption rule.",
      });
    }
  },

  // Admin: get all rules with filters
  async getAllRules(req, res) {
    try {
      const rules = await SalaryExemptionRuleModel.getAllRules(req.query || {});
      return res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error) {
      console.error("Get all salary exemption rules error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch salary exemption rules.",
      });
    }
  },

  // Admin: get rule by id
  async getRuleById(req, res) {
    try {
      const rule = await SalaryExemptionRuleModel.getRuleById(req.params.id);
      if (!rule) {
        return res.status(404).json({
          success: false,
          message: "Salary exemption rule not found.",
        });
      }
      return res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      console.error("Get salary exemption rule by id error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch salary exemption rule.",
      });
    }
  },

  // Admin: create rule
  async createRule(req, res) {
    try {
      const { tax_year, max_exemption_amount, effective_from } = req.body;

      if (!tax_year || max_exemption_amount === undefined || !effective_from) {
        return res.status(400).json({
          success: false,
          message: "tax_year, max_exemption_amount, and effective_from are required.",
        });
      }

      const result = await SalaryExemptionRuleModel.createRule(req.body);
      return res.status(201).json({
        success: true,
        message: "Salary exemption rule created successfully.",
        data: { id: result.insertId, ...req.body },
      });
    } catch (error) {
      console.error("Create salary exemption rule error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create salary exemption rule.",
      });
    }
  },

  // Admin: update rule
  async updateRule(req, res) {
    try {
      const { id } = req.params;
      const existing = await SalaryExemptionRuleModel.getRuleById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Salary exemption rule not found.",
        });
      }

      await SalaryExemptionRuleModel.updateRule(id, req.body);
      const updated = await SalaryExemptionRuleModel.getRuleById(id);

      return res.status(200).json({
        success: true,
        message: "Salary exemption rule updated successfully.",
        data: updated,
      });
    } catch (error) {
      console.error("Update salary exemption rule error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update salary exemption rule.",
      });
    }
  },

  // Admin: toggle status
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Valid status (ACTIVE or INACTIVE) is required.",
        });
      }

      await SalaryExemptionRuleModel.toggleStatus(id, status);
      return res.status(200).json({
        success: true,
        message: `Salary exemption rule status updated to ${status}.`,
      });
    } catch (error) {
      console.error("Toggle salary exemption rule status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update status.",
      });
    }
  },

  // Admin: delete rule
  async deleteRule(req, res) {
    try {
      const { id } = req.params;
      await SalaryExemptionRuleModel.deleteRule(id);
      return res.status(200).json({
        success: true,
        message: "Salary exemption rule deleted successfully.",
      });
    } catch (error) {
      console.error("Delete salary exemption rule error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete salary exemption rule.",
      });
    }
  },

  // Admin: get available tax years
  async getAvailableTaxYears(req, res) {
    try {
      const years = await SalaryExemptionRuleModel.getAvailableTaxYears();
      return res.status(200).json({
        success: true,
        data: years,
      });
    } catch (error) {
      console.error("Get salary exemption tax years error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tax years.",
      });
    }
  },
};

module.exports = SalaryExemptionRuleController;
