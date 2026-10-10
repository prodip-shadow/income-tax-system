import axiosPublic from "@/lib/axiosPublic";

const AdminSalaryExemptionRuleService = {
  // get available tax years
  async getAvailableTaxYears() {
    const response = await axiosPublic.get("/salary-exemption-rules/admin/years");
    return response.data;
  },

  // get all rules with filters
  async getAllRules(params = {}) {
    const query = new URLSearchParams();

    if (params.tax_year) {
      query.set("tax_year", params.tax_year);
    }
    if (params.calculation_type) {
      query.set("calculation_type", params.calculation_type);
    }
    if (params.status) {
      query.set("status", params.status);
    }
    if (params.search) {
      query.set("search", params.search);
    }

    const qs = query.toString();
    const url = qs ? `/salary-exemption-rules/admin/all?${qs}` : "/salary-exemption-rules/admin/all";
    const response = await axiosPublic.get(url);
    return response.data;
  },

  // get rule by id
  async getRuleById(id) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.get(`/salary-exemption-rules/admin/${id}`);
    return response.data;
  },

  // create rule
  async createRule(data) {
    const response = await axiosPublic.post("/salary-exemption-rules", data);
    return response.data;
  },

  // update rule
  async updateRule(id, data) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.put(`/salary-exemption-rules/${id}`, data);
    return response.data;
  },

  // toggle rule status
  async toggleStatus(id, status) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.patch(`/salary-exemption-rules/${id}/status`, { status });
    return response.data;
  },

  // delete rule
  async deleteRule(id) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.delete(`/salary-exemption-rules/${id}`);
    return response.data;
  },
};

export default AdminSalaryExemptionRuleService;
