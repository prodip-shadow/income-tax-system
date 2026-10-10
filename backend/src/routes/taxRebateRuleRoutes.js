const express = require("express");
const router = express.Router();
const TaxRebateRuleController = require("../controllers/taxRebateRuleController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// admin routes
router.get("/admin/years", verifyToken, verifyAdmin, TaxRebateRuleController.getAvailableTaxYears);
router.get("/admin/all", verifyToken, verifyAdmin, TaxRebateRuleController.getAllRules);
router.get("/admin/:id", verifyToken, verifyAdmin, TaxRebateRuleController.getRuleById);
router.post("/", verifyToken, verifyAdmin, TaxRebateRuleController.createRule);
router.put("/:id", verifyToken, verifyAdmin, TaxRebateRuleController.updateRule);
router.patch("/:id/status", verifyToken, verifyAdmin, TaxRebateRuleController.toggleStatus);
router.delete("/:id", verifyToken, verifyAdmin, TaxRebateRuleController.deleteRule);

// public / user route
router.get("/:taxYear", TaxRebateRuleController.getActiveRules);

module.exports = router;
