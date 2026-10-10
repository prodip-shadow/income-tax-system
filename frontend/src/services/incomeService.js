import axiosPublic from "@/lib/axiosPublic";

const IncomeService = {
  async getMyIncome() {
    const response = await axiosPublic.get("/income");

    return response.data;
  },

  async createIncome(incomeData) {
    const response = await axiosPublic.post("/income", incomeData);

    return response.data;
  },

  async updateIncome(incomeId, incomeData) {
    const response = await axiosPublic.put(`/income/${incomeId}`, incomeData);

    return response.data;
  },
  async deleteIncome(incomeId) {
    const response = await axiosPublic.delete(`/income/${incomeId}`);

    return response.data;
  },
};

export default IncomeService;
