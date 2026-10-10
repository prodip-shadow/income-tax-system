const FinancialService = require("../services/financialService");

const FinancialController = {
  async getFinancialSummary(req, res) {
    try {
      const userId = req.user.id;

      const summary = await FinancialService.getFinancialSummary(userId);

      return res.status(200).json({
        success: true,
        message: "Financial summary fetched successfully",
        data: summary,
      });
    } catch (error) {
      console.error("Get Financial Summary Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch financial summary",
      });
    }
  },
};

module.exports = FinancialController;
