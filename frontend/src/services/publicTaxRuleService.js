import axiosPublic from "@/lib/axiosPublic";

const PublicTaxRuleService = {
  // Get all available tax years from database
  async getPublicTaxYears() {
    const response = await axiosPublic.get("/tax-rules/public/years");
    return response.data;
  },

  // Get full rules overview for a specific tax year from database
  async getPublicYearOverview(taxYear) {
    const response = await axiosPublic.get(`/tax-rules/public/year/${taxYear}`);
    return response.data;
  },

  // Get full overview for all active tax years in one shot from database
  async getPublicAllYearsOverview() {
    const response = await axiosPublic.get("/tax-rules/public/all-years");
    return response.data;
  },
};

export default PublicTaxRuleService;
