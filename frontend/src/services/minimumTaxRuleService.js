import axiosPublic from "@/lib/axiosPublic";

const MinimumTaxRuleService = {
  // get active minimum tax rules by tax year
  async getRulesByTaxYear(taxYear) {
    const response = await axiosPublic.get(
      `/minimum-tax-rules/${taxYear}`,
    );

    return response.data;
  },

  // get single rule by area code
  async getRuleByAreaCode(taxYear, areaCode) {
    const response = await axiosPublic.get(
      `/minimum-tax-rules/${taxYear}/${areaCode}`,
    );

    return response.data;
  },
};

export default MinimumTaxRuleService;