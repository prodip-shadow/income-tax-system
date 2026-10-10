import axiosPublic from "@/lib/axiosPublic";

const AdminMinimumTaxRuleService = {
  // get available tax years
  async getAvailableTaxYears() {
    const response = await axiosPublic.get("/minimum-tax-rules/admin/years");
    return response.data;
  },

  // get all minimum tax rules with filters
  async getAllRules(params = {}) {
    const query = new URLSearchParams();

    if (params.tax_year) {
      query.set("tax_year", params.tax_year);
    }
    if (params.rule_type) {
      query.set("rule_type", params.rule_type);
    }
    if (params.status) {
      query.set("status", params.status);
    }
    if (params.search) {
      query.set("search", params.search);
    }

    const qs = query.toString();
    const url = qs ? `/minimum-tax-rules/admin/all?${qs}` : "/minimum-tax-rules/admin/all";
    const response = await axiosPublic.get(url);
    return response.data;
  },

  // get rule by id
  async getRuleById(id) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.get(`/minimum-tax-rules/admin/${id}`);
    return response.data;
  },

  // create rule
  async createRule(data) {
    const response = await axiosPublic.post("/minimum-tax-rules", data);
    return response.data;
  },

  // update rule
  async updateRule(id, data) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.put(`/minimum-tax-rules/${id}`, data);
    return response.data;
  },

  // toggle rule status
  async toggleStatus(id, status) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.patch(`/minimum-tax-rules/${id}/status`, { status });
    return response.data;
  },

  // delete rule
  async deleteRule(id) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.delete(`/minimum-tax-rules/${id}`);
    return response.data;
  },
};

export default AdminMinimumTaxRuleService;
