import axiosPublic from "@/lib/axiosPublic";

const ExpenseService = {
  // get my expenses

  async getMyExpense() {
    const response = await axiosPublic.get("/expense");

    return response.data;
  },

  // get expense types
  // optional category:
  // business
  // personal
  // without category -> all active expense types

  async getExpenseTypes(category = null) {
    const response = await axiosPublic.get(
      "/expense/types",
      {
        params: category
          ? {
              category,
            }
          : {},
      },
    );

    return response.data;
  },

  // get single expense type

  async getExpenseTypeById(expenseTypeId) {
    const response = await axiosPublic.get(
      `/expense/types/${expenseTypeId}`,
    );

    return response.data;
  },

  // create expense

  async createExpense(expenseData) {
    const response = await axiosPublic.post(
      "/expense",
      expenseData,
    );

    return response.data;
  },

  // update expense

  async updateExpense(
    expenseId,
    expenseData,
  ) {
    const response = await axiosPublic.put(
      `/expense/${expenseId}`,
      expenseData,
    );

    return response.data;
  },

  // delete expense

  async deleteExpense(expenseId) {
    const response = await axiosPublic.delete(
      `/expense/${expenseId}`,
    );

    return response.data;
  },
};

export default ExpenseService;