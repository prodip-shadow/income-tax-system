const TaxCalculationModel = require("../models/taxCalculationModel");

const TaxCalculationDetailModel = require("../models/taxCalculationDetailModel");

const TaxCalculationDetailController = {
  // get all details of one calculation
  // get /api/tax-calculation-details/:calculationid

  async getDetails(req, res) {
    try {
      const userId = req.user.id;

      const calculationId = Number(req.params.calculationId);

      // validate calculation id

      if (!Number.isInteger(calculationId) || calculationId <= 0) {
        return res.status(400).json({
          success: false,

          message: "Invalid calculation ID",
        });
      }

      // check calculation ownership

      const calculation = await TaxCalculationModel.getCalculationById(
        calculationId,
        userId,
      );

      if (!calculation) {
        return res.status(404).json({
          success: false,

          message: "Tax calculation not found",
        });
      }

      // get calculation details

      const details =
        await TaxCalculationDetailModel.getDetailsByCalculationId(
          calculationId,
        );

      // success

      return res.status(200).json({
        success: true,

        message: "Tax calculation details fetched successfully",

        data: {
          calculationId,

          details,
        },
      });
    } catch (error) {
      console.error("Get Tax Calculation Details Error:", error);

      return res.status(500).json({
        success: false,

        message: "Internal server error",
      });
    }
  },

  // get one detail
  // get /api/tax-calculation-details/:calculationid/:detailid

  async getDetail(req, res) {
    try {
      const userId = req.user.id;

      const calculationId = Number(req.params.calculationId);

      const detailId = Number(req.params.detailId);

      // validate ids

      if (
        !Number.isInteger(calculationId) ||
        calculationId <= 0 ||
        !Number.isInteger(detailId) ||
        detailId <= 0
      ) {
        return res.status(400).json({
          success: false,

          message: "Invalid calculation ID or detail ID",
        });
      }

      // check calculation ownership

      const calculation = await TaxCalculationModel.getCalculationById(
        calculationId,
        userId,
      );

      if (!calculation) {
        return res.status(404).json({
          success: false,

          message: "Tax calculation not found",
        });
      }

      // get detail

      const details = await TaxCalculationDetailModel.getDetailById(
        detailId,
        calculationId,
      );

      if (!details || details.length === 0) {
        return res.status(404).json({
          success: false,

          message: "Tax calculation detail not found",
        });
      }

      // success

      return res.status(200).json({
        success: true,

        message: "Tax calculation detail fetched successfully",

        data: details[0],
      });
    } catch (error) {
      console.error("Get Tax Calculation Detail Error:", error);

      return res.status(500).json({
        success: false,

        message: "Internal server error",
      });
    }
  },
};

// export

module.exports = TaxCalculationDetailController;
