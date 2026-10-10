const express = require("express");

const verifyToken = require("../middleware/verifyToken");

const TaxCalculationDetailController = require("../controllers/taxCalculationDetailController");

const router = express.Router();

// get all details of a calculation
// get /api/tax-calculation-details/:calculationid

router.get(
  "/:calculationId",
  verifyToken,
  TaxCalculationDetailController.getDetails,
);

// get one specific detail
// get /api/tax-calculation-details/:calculationid/:detailid

router.get(
  "/:calculationId/:detailId",
  verifyToken,
  TaxCalculationDetailController.getDetail,
);

module.exports = router;
