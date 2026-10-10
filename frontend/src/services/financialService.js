import axiosPublic from "@/lib/axiosPublic";

const FinancialService = {
  async getIncome() {
    const response = await axiosPublic.get("/income");

    return response.data;
  },

  async getExpense() {
    const response = await axiosPublic.get("/expense");

    return response.data;
  },

  async getFinancialSummary() {
    const response = await axiosPublic.get("/financial/summary");

    return response.data;
  },
};

export default FinancialService;
