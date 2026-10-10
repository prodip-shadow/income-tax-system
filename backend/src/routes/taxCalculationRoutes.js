const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const TaxCalculationController = require("../controllers/taxCalculationController");
const router = express.Router();

router.post("/", verifyToken, TaxCalculationController.calculateTax);
router.get("/", verifyToken, TaxCalculationController.getCalculations);
router.get("/:id", verifyToken, TaxCalculationController.getCalculationById);
router.delete("/:id", verifyToken, TaxCalculationController.deleteCalculation);

module.exports = router;
