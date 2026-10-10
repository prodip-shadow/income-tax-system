const express = require("express");

const router =
    express.Router();

const verifyToken =
    require("../middleware/verifyToken");

const TaxDeductionController =
    require("../controllers/taxDeductionController");


// create tax deduction
// post /api/tax-deductions

router.post(
    "/",
    verifyToken,
    TaxDeductionController.createDeduction
);


// get all my tax deductions
// get /api/tax-deductions

router.get(
    "/",
    verifyToken,
    TaxDeductionController.getMyDeductions
);


// get deductions by tax year
// get /api/tax-deductions/year/:taxyear

router.get(
    "/year/:taxYear",
    verifyToken,
    TaxDeductionController.getMyDeductionsByTaxYear
);


// get total deduction
// get /api/tax-deductions/total/:taxyear

router.get(
    "/total/:taxYear",
    verifyToken,
    TaxDeductionController.getTotalDeduction
);


// get single deduction
// get /api/tax-deductions/:id

router.get(
    "/:id",
    verifyToken,
    TaxDeductionController.getDeductionById
);


// update tax deduction
// put /api/tax-deductions/:id

router.put(
    "/:id",
    verifyToken,
    TaxDeductionController.updateDeduction
);


// delete tax deduction
// delete /api/tax-deductions/:id

router.delete(
    "/:id",
    verifyToken,
    TaxDeductionController.deleteDeduction
);


module.exports = router;