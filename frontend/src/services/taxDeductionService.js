import axiosPublic from "@/lib/axiosPublic";

const TaxDeductionService = {
  // get available tax years
  // uses existing tax rule tax-year endpoint

  async getAvailableTaxYears() {
    const response = await axiosPublic.get(
      "/tax-rules/years"
    );

    return response.data;
  },

  // get my deductions

  async getMyDeductions() {
    const response = await axiosPublic.get(
      "/tax-deductions"
    );

    return response.data;
  },

  // get my deductions by tax year

  async getMyDeductionsByTaxYear(taxYear) {
    if (!taxYear) {
      throw new Error("Tax year is required.");
    }

    const response = await axiosPublic.get(
      `/tax-deductions/year/${taxYear}`
    );

    return response.data;
  },

  // get total deduction

  async getTotalDeduction(taxYear) {
    if (!taxYear) {
      throw new Error("Tax year is required.");
    }

    const response = await axiosPublic.get(
      `/tax-deductions/total/${taxYear}`
    );

    return response.data;
  },

  // get active investment rules by tax year

  async getActiveDeductionRules(taxYear) {
    if (!taxYear) {
      throw new Error("Tax year is required.");
    }

    const response = await axiosPublic.get(
      `/tax-deduction-rules/${taxYear}`
    );

    return response.data;
  },

  // create investment

  async createDeduction(deductionData) {
    const response = await axiosPublic.post(
      "/tax-deductions",
      deductionData
    );

    return response.data;
  },

  // get single investment

  async getDeductionById(id) {
    if (!id) {
      throw new Error("Deduction ID is required.");
    }

    const response = await axiosPublic.get(
      `/tax-deductions/${id}`
    );

    return response.data;
  },

  // update investment

  async updateDeduction(id, deductionData) {
    if (!id) {
      throw new Error("Deduction ID is required.");
    }

    const response = await axiosPublic.put(
      `/tax-deductions/${id}`,
      deductionData
    );

    return response.data;
  },

  // delete investment

  async deleteDeduction(id) {
    if (!id) {
      throw new Error("Deduction ID is required.");
    }

    const response = await axiosPublic.delete(
      `/tax-deductions/${id}`
    );

    return response.data;
  },
};

export default TaxDeductionService;