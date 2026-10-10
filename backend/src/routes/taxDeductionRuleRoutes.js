const express = require("express");

const TaxDeductionRuleController = require("../controllers/taxDeductionRuleController");

const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// get active deduction rules by tax year
// get /api/tax-deduction-rules/2026-27

router.get("/:taxYear", verifyToken, TaxDeductionRuleController.getActiveDeductionRules);

// get one deduction rule
// get /api/tax-deduction-rules/id/1

router.get("/id/:id", verifyToken, TaxDeductionRuleController.getDeductionRuleById);

// create deduction rule
// post /api/tax-deduction-rules

router.post("/", verifyToken, verifyAdmin, TaxDeductionRuleController.createDeductionRule);

// update deduction rule
// put /api/tax-deduction-rules/:id

router.put("/:id", verifyToken, verifyAdmin, TaxDeductionRuleController.updateDeductionRule);

// deactivate deduction rule
// patch /api/tax-deduction-rules/:id/deactivate

router.patch(
  "/:id/deactivate",
  verifyToken,
  verifyAdmin,
  TaxDeductionRuleController.deactivateDeductionRule,
);

module.exports = router;
