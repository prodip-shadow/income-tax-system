const ExpenseModel = require("../models/ExpenseModel");

const ExpenseService = {
  // validate expense type id

  validateExpenseTypeId(expenseTypeId) {
    if (
      expenseTypeId === undefined ||
      expenseTypeId === null ||
      expenseTypeId === ""
    ) {
      throw new Error("Expense type is required");
    }

    const id = Number(expenseTypeId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid expense type");
    }

    return id;
  },

  // get expense types

  async getExpenseTypes(category = null) {
    let normalizedCategory = null;

    if (category !== null && category !== undefined && category !== "") {
      normalizedCategory = String(category).trim().toUpperCase();

      if (
        normalizedCategory !== "BUSINESS" &&
        normalizedCategory !== "PERSONAL"
      ) {
        throw new Error("Invalid expense category");
      }
    }

    return await ExpenseModel.findExpenseTypes(normalizedCategory);
  },

  // get single expense type

  async getExpenseTypeById(expenseTypeId) {
    const id = this.validateExpenseTypeId(expenseTypeId);

    const expenseType = await ExpenseModel.findExpenseTypeById(id);

    if (!expenseType) {
      throw new Error("Invalid or inactive expense type");
    }

    return expenseType;
  },

  // validate expense data

  validateExpenseData(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Expense data is required");
    }

    // expense type

    const expenseTypeId = this.validateExpenseTypeId(data.expense_type_id);

    // amount

    if (
      data.amount === undefined ||
      data.amount === null ||
      data.amount === ""
    ) {
      throw new Error("Amount is required");
    }

    const amount = Number(data.amount);

    if (!Number.isFinite(amount)) {
      throw new Error("Amount must be a valid number");
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // expense date

    if (!data.expense_date) {
      throw new Error("Expense date is required");
    }

    const expenseDate = new Date(data.expense_date);

    if (Number.isNaN(expenseDate.getTime())) {
      throw new Error("Invalid expense date");
    }

    // description

    let description = null;

    if (data.description !== undefined && data.description !== null) {
      description = String(data.description).trim();

      if (description === "") {
        description = null;
      }

      if (description && description.length > 255) {
        throw new Error("Description cannot exceed 255 characters");
      }
    }

    return {
      expense_type_id: expenseTypeId,
      amount,
      expense_date: data.expense_date,
      description,
    };
  },

  // create expense

  async createExpense(userId, data) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const validated = this.validateExpenseData(data);

    // get master expense type

    const expenseType = await this.getExpenseTypeById(
      validated.expense_type_id,
    );

     // category master table থেকে আসবে। user business/personal manually পাঠাতে পারবে না।

    const isTaxDeductible = expenseType.expense_category === "BUSINESS" ? 1 : 0;

    const expenseData = {
      user_id: userId,

      expense_type_id: expenseType.id,

      expense_type: expenseType.expense_name,

      expense_category: expenseType.expense_category,

      is_tax_deductible: isTaxDeductible,

      description: validated.description,

      amount: validated.amount,

      expense_date: validated.expense_date,
    };

    const result = await ExpenseModel.create(expenseData);

    if (!result || !result.insertId) {
      throw new Error("Failed to create expense");
    }

    return await ExpenseModel.findById(result.insertId);
  },

  // get my expenses

  async getMyExpenses(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    return await ExpenseModel.findByUserId(userId);
  },

  // get single expense

  async getExpenseById(expenseId, userId) {
    if (!expenseId) {
      throw new Error("Expense ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const expense = await ExpenseModel.findById(expenseId);

    if (!expense) {
      throw new Error("Expense not found");
    }

    if (Number(expense.user_id) !== Number(userId)) {
      throw new Error("You are not authorized to access this expense");
    }

    return expense;
  },

  // update expense

  async updateExpense(expenseId, userId, data) {
    if (!expenseId) {
      throw new Error("Expense ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // existing expense

    const existing = await ExpenseModel.findById(expenseId);

    if (!existing) {
      throw new Error("Expense not found");
    }

    // ownership

    if (Number(existing.user_id) !== Number(userId)) {
      throw new Error("You are not authorized to update this expense");
    }

    // validate request

    const validated = this.validateExpenseData(data);

    // get master expense type

    const expenseType = await this.getExpenseTypeById(
      validated.expense_type_id,
    );

    const isTaxDeductible = expenseType.expense_category === "BUSINESS" ? 1 : 0;

    const updateData = {
      expense_type_id: expenseType.id,

      expense_type: expenseType.expense_name,

      expense_category: expenseType.expense_category,

      is_tax_deductible: isTaxDeductible,

      description: validated.description,

      amount: validated.amount,

      expense_date: validated.expense_date,
    };

    await ExpenseModel.update(expenseId, updateData);

    return await ExpenseModel.findById(expenseId);
  },

  // delete expense

  async deleteExpense(expenseId, userId) {
    if (!expenseId) {
      throw new Error("Expense ID is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const existing = await ExpenseModel.findById(expenseId);

    if (!existing) {
      throw new Error("Expense not found");
    }

    if (Number(existing.user_id) !== Number(userId)) {
      throw new Error("You are not authorized to delete this expense");
    }

    await ExpenseModel.delete(expenseId);

    return {
      message: "Expense deleted successfully",
    };
  },

  // total expense

  async getTotalExpense(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const result = await ExpenseModel.getTotalByUserId(userId);

    return {
      user_id: userId,

      total_expense: Number(result?.total_expense || 0),
    };
  },

  // allowable business expense

  async getAllowableBusinessExpense(userId, startDate, endDate) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    const result = await ExpenseModel.getAllowableBusinessExpense(
      userId,
      startDate,
      endDate,
    );

    return {
      user_id: userId,

      start_date: startDate,

      end_date: endDate,

      allowable_business_expense: Number(
        result?.allowable_business_expense || 0,
      ),
    };
  },
};

module.exports = ExpenseService;
