const IncomeModel = require("../models/IncomeModel");

const IncomeController = {
  async createIncome(req, res) {
    try {
      const { income_type, source_name, amount, income_date, description } =
        req.body;

      if (!income_type || !source_name || !amount || !income_date) {
        return res.status(400).json({
          success: false,
          message: "Required income fields are missing",
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      const user_id = req.user.id;

      const incomeData = {
        user_id,
        income_type,
        source_name,
        amount,
        income_date,
        description,
      };

      const result = await IncomeModel.create(incomeData);

      return res.status(201).json({
        success: true,
        message: "Income created successfully",
        data: {
          id: result.insertId,
          user_id,
          income_type,
          source_name,
          amount,
          income_date,
          description,
        },
      });
    } catch (error) {
      console.error("Create Income Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async getMyIncome(req, res) {
    try {
      const userId = req.user.id;

      const incomes = await IncomeModel.findByUserId(userId);

      return res.status(200).json({
        success: true,
        message: "Incomes fetched successfully",
        data: incomes,
      });
    } catch (error) {
      console.error("Get My Income Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async getIncomeById(req, res) {
    try {
      const incomeId = req.params.id;

      const userId = req.user.id;

      const income = await IncomeModel.findById(incomeId);

      if (!income) {
        return res.status(404).json({
          success: false,
          message: "Income not found",
        });
      }

      if (income.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this income",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Income fetched successfully",
        data: income,
      });
    } catch (error) {
      console.error("Get Income By ID Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async updateIncome(req, res) {
    try {
      const incomeId = req.params.id;

      const userId = req.user.id;

      const { income_type, source_name, amount, income_date, description } =
        req.body;

      const income = await IncomeModel.findById(incomeId);

      if (!income) {
        return res.status(404).json({
          success: false,
          message: "Income not found",
        });
      }

      if (income.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this income",
        });
      }

      if (!income_type || !source_name || !amount || !income_date) {
        return res.status(400).json({
          success: false,
          message: "Required income fields are missing",
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      const incomeData = {
        income_type,
        source_name,
        amount,
        income_date,
        description,
      };

      const result = await IncomeModel.update(incomeId, incomeData);

      return res.status(200).json({
        success: true,
        message: "Income updated successfully",
        data: {
          id: incomeId,
          income_type,
          source_name,
          amount,
          income_date,
          description,
        },
      });
    } catch (error) {
      console.error("Update Income Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async deleteIncome(req, res) {
    try {
      const incomeId = req.params.id;

      const userId = req.user.id;

      const income = await IncomeModel.findById(incomeId);

      if (!income) {
        return res.status(404).json({
          success: false,
          message: "Income not found",
        });
      }

      if (income.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this income",
        });
      }

      const result = await IncomeModel.delete(incomeId);

      return res.status(200).json({
        success: true,
        message: "Income deleted successfully",
      });
    } catch (error) {
      console.error("Delete Income Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = IncomeController;
