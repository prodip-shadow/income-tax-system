const express = require("express");
const router = express.Router();
const MinimumTaxRuleController = require("../controllers/minimumTaxRuleController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// admin routes
router.get("/admin/years", verifyToken, verifyAdmin, MinimumTaxRuleController.getAvailableTaxYears);
router.get("/admin/all", verifyToken, verifyAdmin, MinimumTaxRuleController.getAllRules);
router.get("/admin/:id", verifyToken, verifyAdmin, MinimumTaxRuleController.getRuleById);
router.post("/", verifyToken, verifyAdmin, MinimumTaxRuleController.createRule);
router.put("/:id", verifyToken, verifyAdmin, MinimumTaxRuleController.updateRule);
router.patch("/:id/status", verifyToken, verifyAdmin, MinimumTaxRuleController.toggleStatus);
router.delete("/:id", verifyToken, verifyAdmin, MinimumTaxRuleController.deleteRule);

// public / user routes
router.get("/:taxYear", MinimumTaxRuleController.getRulesByTaxYear);
router.get("/:taxYear/:areaCode", MinimumTaxRuleController.getRuleByAreaCode);

module.exports = router;