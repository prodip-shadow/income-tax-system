import axiosPublic from "@/lib/axiosPublic";

const TaxCalculationService = {
  // get available tax years

  async getAvailableTaxYears() {
    const response = await axiosPublic.get(
      "/tax-rules/years"
    );

    return response.data;
  },

  // calculate tax

  async calculateTax(taxYear) {
    if (!taxYear) {
      throw new Error("Tax year is required.");
    }

    const response = await axiosPublic.post(
      "/tax-calculations",
      {
        tax_year: taxYear,
      }
    );

    return response.data;
  },

  // get all tax calculations

  async getCalculations() {
    const response = await axiosPublic.get(
      "/tax-calculations"
    );

    return response.data;
  },

  // get single tax calculation

  async getCalculationById(id) {
    if (!id) {
      throw new Error(
        "Calculation ID is required."
      );
    }

    const response = await axiosPublic.get(
      `/tax-calculations/${id}`
    );

    return response.data;
  },

  // delete single tax calculation
  async deleteCalculation(id) {
    if (!id) {
      throw new Error("Calculation ID is required.");
    }

    const response = await axiosPublic.delete(
      `/tax-calculations/${id}`
    );

    return response.data;
  },
};

export default TaxCalculationService;