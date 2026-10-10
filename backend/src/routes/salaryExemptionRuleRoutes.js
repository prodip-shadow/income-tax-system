const express = require("express");
const router = express.Router();
const SalaryExemptionRuleController = require("../controllers/salaryExemptionRuleController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// Admin routes
router.get("/admin/years", verifyToken, verifyAdmin, SalaryExemptionRuleController.getAvailableTaxYears);
router.get("/admin/all", verifyToken, verifyAdmin, SalaryExemptionRuleController.getAllRules);
router.get("/admin/:id", verifyToken, verifyAdmin, SalaryExemptionRuleController.getRuleById);
router.post("/", verifyToken, verifyAdmin, SalaryExemptionRuleController.createRule);
router.put("/:id", verifyToken, verifyAdmin, SalaryExemptionRuleController.updateRule);
router.patch("/:id/status", verifyToken, verifyAdmin, SalaryExemptionRuleController.toggleStatus);
router.delete("/:id", verifyToken, verifyAdmin, SalaryExemptionRuleController.deleteRule);

// Public / User route
router.get("/:taxYear", SalaryExemptionRuleController.getActiveRule);

module.exports = router;
