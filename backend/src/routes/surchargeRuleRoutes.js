const express = require("express");
const router = express.Router();
const SurchargeRuleController = require("../controllers/surchargeRuleController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// admin routes
router.get("/admin/years", verifyToken, verifyAdmin, SurchargeRuleController.getAvailableTaxYears);
router.get("/admin/all", verifyToken, verifyAdmin, SurchargeRuleController.getAllRules);
router.get("/admin/:id", verifyToken, verifyAdmin, SurchargeRuleController.getRuleById);
router.post("/", verifyToken, verifyAdmin, SurchargeRuleController.createRule);
router.put("/:id", verifyToken, verifyAdmin, SurchargeRuleController.updateRule);
router.patch("/:id/status", verifyToken, verifyAdmin, SurchargeRuleController.toggleStatus);
router.delete("/:id", verifyToken, verifyAdmin, SurchargeRuleController.deleteRule);

// public / user route
router.get("/:taxYear", SurchargeRuleController.getActiveRules);

module.exports = router;
