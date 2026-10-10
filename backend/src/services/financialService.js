const IncomeModel = require("../models/IncomeModel");
const ExpenseModel = require("../models/ExpenseModel");

const FinancialService = {
  async getFinancialSummary(userId) {
    const income = await IncomeModel.getTotalByUserId(userId);

    const expense = await ExpenseModel.getTotalByUserId(userId);

    const totalIncome = Number(income.total_income);

    const totalExpense = Number(expense.total_expense);

    const netBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netBalance,
    };
  },
};

module.exports = FinancialService;
