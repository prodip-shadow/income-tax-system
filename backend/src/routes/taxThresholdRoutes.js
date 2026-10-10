const express = require("express");
const router = express.Router();
const TaxThresholdController = require("../controllers/taxThresholdController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// admin routes
router.get("/admin/years", verifyToken, verifyAdmin, TaxThresholdController.getAvailableTaxYears);
router.get("/admin/all", verifyToken, verifyAdmin, TaxThresholdController.getAllThresholds);
router.get("/admin/:id", verifyToken, verifyAdmin, TaxThresholdController.getThresholdById);
router.post("/", verifyToken, verifyAdmin, TaxThresholdController.createThreshold);
router.put("/:id", verifyToken, verifyAdmin, TaxThresholdController.updateThreshold);
router.patch("/:id/status", verifyToken, verifyAdmin, TaxThresholdController.toggleStatus);
router.delete("/:id", verifyToken, verifyAdmin, TaxThresholdController.deleteThreshold);

// public / user route
router.get("/:taxYear", TaxThresholdController.getActiveThresholds);

module.exports = router;
