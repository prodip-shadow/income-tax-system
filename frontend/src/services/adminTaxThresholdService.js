import axiosPublic from "@/lib/axiosPublic";

const AdminTaxThresholdService = {
  // get available tax years
  async getAvailableTaxYears() {
    const response = await axiosPublic.get("/tax-thresholds/admin/years");
    return response.data;
  },

  // get all thresholds with filters
  async getAllThresholds(params = {}) {
    const query = new URLSearchParams();

    if (params.tax_year) {
      query.set("tax_year", params.tax_year);
    }
    if (params.category) {
      query.set("category", params.category);
    }
    if (params.status) {
      query.set("status", params.status);
    }
    if (params.search) {
      query.set("search", params.search);
    }

    const qs = query.toString();
    const url = qs ? `/tax-thresholds/admin/all?${qs}` : "/tax-thresholds/admin/all";
    const response = await axiosPublic.get(url);
    return response.data;
  },

  // get threshold by id
  async getThresholdById(id) {
    if (!id) throw new Error("Threshold ID is required.");
    const response = await axiosPublic.get(`/tax-thresholds/admin/${id}`);
    return response.data;
  },

  // create threshold
  async createThreshold(data) {
    const response = await axiosPublic.post("/tax-thresholds", data);
    return response.data;
  },

  // update threshold
  async updateThreshold(id, data) {
    if (!id) throw new Error("Threshold ID is required.");
    const response = await axiosPublic.put(`/tax-thresholds/${id}`, data);
    return response.data;
  },

  // toggle status
  async toggleStatus(id, status) {
    if (!id) throw new Error("Threshold ID is required.");
    const response = await axiosPublic.patch(`/tax-thresholds/${id}/status`, { status });
    return response.data;
  },

  // delete threshold
  async deleteThreshold(id) {
    if (!id) throw new Error("Threshold ID is required.");
    const response = await axiosPublic.delete(`/tax-thresholds/${id}`);
    return response.data;
  },
};

export default AdminTaxThresholdService;
