const ExpenseService = require("../services/expenseService");

const ExpenseController = {
  // get all expense types

  async getExpenseTypes(req, res) {
    try {
      const category = req.query.category || null;

      const expenseTypes = await ExpenseService.getExpenseTypes(category);

      return res.status(200).json({
        success: true,
        message: "Expense types fetched successfully",
        data: expenseTypes,
      });
    } catch (error) {
      if (error.message.includes("Invalid expense category")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Get Expense Types Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // get single expense type

  async getExpenseTypeById(req, res) {
    try {
      const expenseTypeId = Number(req.params.id);

      if (!Number.isInteger(expenseTypeId) || expenseTypeId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense type ID",
        });
      }

      const expenseType =
        await ExpenseService.getExpenseTypeById(expenseTypeId);

      return res.status(200).json({
        success: true,
        message: "Expense type fetched successfully",
        data: expenseType,
      });
    } catch (error) {
      if (
        error.message.includes("Invalid") ||
        error.message.includes("inactive")
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Get Expense Type By ID Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // create expense

  async createExpense(req, res) {
    try {
      const userId = req.user.id;

      const result = await ExpenseService.createExpense(userId, req.body);

      return res.status(201).json({
        success: true,
        message: "Expense created successfully",
        data: result,
      });
    } catch (error) {
      if (
        error.message.includes("required") ||
        error.message.includes("must be") ||
        error.message.includes("greater than") ||
        error.message.includes("Invalid") ||
        error.message.includes("inactive")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Create Expense Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // get my expenses

  async getMyExpense(req, res) {
    try {
      const userId = req.user.id;

      const expenses = await ExpenseService.getMyExpenses(userId);

      return res.status(200).json({
        success: true,
        message: "Expenses fetched successfully",
        data: expenses,
      });
    } catch (error) {
      console.error("Get My Expense Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // get expense by id

  async getExpenseById(req, res) {
    try {
      const expenseId = Number(req.params.id);

      const userId = req.user.id;

      if (!Number.isInteger(expenseId) || expenseId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
      }

      const expense = await ExpenseService.getExpenseById(expenseId, userId);

      return res.status(200).json({
        success: true,
        message: "Expense fetched successfully",
        data: expense,
      });
    } catch (error) {
      if (error.message === "Expense not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("not authorized")) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Get Expense By ID Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // update expense

  async updateExpense(req, res) {
    try {
      const expenseId = Number(req.params.id);

      const userId = req.user.id;

      if (!Number.isInteger(expenseId) || expenseId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
      }

      const result = await ExpenseService.updateExpense(
        expenseId,
        userId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Expense updated successfully",
        data: result,
      });
    } catch (error) {
      if (error.message === "Expense not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("not authorized")) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes("required") ||
        error.message.includes("must be") ||
        error.message.includes("greater than") ||
        error.message.includes("Invalid") ||
        error.message.includes("inactive")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Update Expense Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // delete expense

  async deleteExpense(req, res) {
    try {
      const expenseId = Number(req.params.id);

      const userId = req.user.id;

      if (!Number.isInteger(expenseId) || expenseId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
      }

      await ExpenseService.deleteExpense(expenseId, userId);

      return res.status(200).json({
        success: true,
        message: "Expense deleted successfully",
      });
    } catch (error) {
      if (error.message === "Expense not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("not authorized")) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Delete Expense Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // get total expense

  async getTotalExpense(req, res) {
    try {
      const userId = req.user.id;

      const result = await ExpenseService.getTotalExpense(userId);

      return res.status(200).json({
        success: true,
        message: "Total expense fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error("Get Total Expense Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // get allowable business expense

  async getAllowableBusinessExpense(req, res) {
    try {
      const userId = req.user.id;

      const { start_date, end_date } = req.query;

      const result = await ExpenseService.getAllowableBusinessExpense(
        userId,
        start_date,
        end_date,
      );

      return res.status(200).json({
        success: true,
        message: "Allowable business expense fetched successfully",
        data: result,
      });
    } catch (error) {
      if (error.message.includes("required")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Get Allowable Business Expense Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = ExpenseController;
