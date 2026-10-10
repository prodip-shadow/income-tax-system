const express = require("express");

const router = express.Router();

const TaxRuleController = require("../controllers/taxRuleController");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// Public endpoints (no token required)
router.get("/public/years", TaxRuleController.getPublicTaxYears);
router.get("/public/all-years", TaxRuleController.getPublicAllYearsOverview);
router.get("/public/year/:taxYear", TaxRuleController.getPublicYearOverview);

// get available tax years
// user + admin
// get /api/tax-rules/years

router.get(
  "/years",
  verifyToken,
  TaxRuleController.getAvailableTaxYears
);

// get all rules of a tax year
// admin only
// get /api/tax-rules/2028-29/all

router.get(
  "/:taxYear/all",
  verifyToken,
  verifyAdmin,
  TaxRuleController.getAllTaxRules
);

// get tax year status
// admin only
// get /api/tax-rules/2028-29/status

router.get(
  "/:taxYear/status",
  verifyToken,
  verifyAdmin,
  TaxRuleController.getTaxYearStatus
);

// update tax year status
// admin only
// patch /api/tax-rules/2028-29/status

router.patch(
  "/:taxYear/status",
  verifyToken,
  verifyAdmin,
  TaxRuleController.updateTaxYearStatus
);

// create tax rule
// admin only
// post /api/tax-rules

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  TaxRuleController.createTaxRule
);

// get active rules
// user + admin
// get /api/tax-rules/2028-29

router.get(
  "/:taxYear",
  verifyToken,
  TaxRuleController.getActiveTaxRules
);

// update single slab
// admin only
// put /api/tax-rules/:id

router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  TaxRuleController.updateTaxRule
);

module.exports = router;