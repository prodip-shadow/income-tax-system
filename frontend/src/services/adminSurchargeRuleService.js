import axiosPublic from "@/lib/axiosPublic";

const AdminSurchargeRuleService = {
  // get available tax years
  async getAvailableTaxYears() {
    const response = await axiosPublic.get("/surcharge-rules/admin/years");
    return response.data;
  },

  // get all surcharge rules with filters
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
    const url = qs ? `/surcharge-rules/admin/all?${qs}` : "/surcharge-rules/admin/all";
    const response = await axiosPublic.get(url);
    return response.data;
  },

  // get surcharge rule by id
  async getRuleById(id) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.get(`/surcharge-rules/admin/${id}`);
    return response.data;
  },

  // create surcharge rule
  async createRule(data) {
    const response = await axiosPublic.post("/surcharge-rules", data);
    return response.data;
  },

  // update surcharge rule
  async updateRule(id, data) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.put(`/surcharge-rules/${id}`, data);
    return response.data;
  },

  // toggle status
  async toggleStatus(id, status) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.patch(`/surcharge-rules/${id}/status`, { status });
    return response.data;
  },

  // delete surcharge rule
  async deleteRule(id) {
    if (!id) throw new Error("Rule ID is required.");
    const response = await axiosPublic.delete(`/surcharge-rules/${id}`);
    return response.data;
  },
};

export default AdminSurchargeRuleService;
