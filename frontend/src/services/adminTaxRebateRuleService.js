import axiosPublic from "@/lib/axiosPublic";

const AdminTaxRebateRuleService = {
  // get available tax years
  async getAvailableTaxYears() {
    const response = await axiosPublic.get("/tax-rebate-rules/admin/years");
    return response.data;
  },

  // get all rebate rules with filters
  async getAllRules(params = {}) {
    const query = new URLSearchParams();

    if (params.tax_year) {
      query.set("tax_year", params.tax_year);
    }
    if (params.status) {
      query.set("status", params.status);
    }
    if (params.search) {
      query.set("search", params.search);
    }

    const qs = query.toString();
    const url = qs ? `/tax-rebate-rules/admin/all?${qs}` : "/tax-rebate-rules/admin/all";
    const response = await axiosPublic.get(url);
    return response.data;
  },

  // get rebate rule by id
  async getRuleById(id) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.get(`/tax-rebate-rules/admin/${id}`);
    return response.data;
  },

  // create rebate rule
  async createRule(data) {
    const response = await axiosPublic.post("/tax-rebate-rules", data);
    return response.data;
  },

  // update rebate rule
  async updateRule(id, data) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.put(`/tax-rebate-rules/${id}`, data);
    return response.data;
  },

  // toggle status
  async toggleStatus(id, status) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.patch(`/tax-rebate-rules/${id}/status`, { status });
    return response.data;
  },

  // delete rebate rule
  async deleteRule(id) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.delete(`/tax-rebate-rules/${id}`);
    return response.data;
  },
};

export default AdminTaxRebateRuleService;
