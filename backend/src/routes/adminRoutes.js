const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/verifyToken");

const verifyAdmin = require("../middleware/verifyAdmin");

const AdminController = require("../controllers/adminController");

const TaxDeductionRuleController = require("../controllers/taxDeductionRuleController");

router.get(
  "/dashboard",
  verifyToken,
  verifyAdmin,
  AdminController.getDashboardStats,
);

router.get(
  "/users",
  verifyToken,
  verifyAdmin,
  AdminController.getAllUsers,
);

router.get(
  "/users/:id",
  verifyToken,
  verifyAdmin,
  AdminController.getUserById,
);

router.patch(
  "/users/:id/role",
  verifyToken,
  verifyAdmin,
  AdminController.updateUserRole,
);

router.delete(
  "/users/:id",
  verifyToken,
  verifyAdmin,
  AdminController.deleteUser,
);

// admin tax deduction rules

router.get(
  "/tax-deduction-rules",
  verifyToken,
  verifyAdmin,
  TaxDeductionRuleController.getAllDeductionRules,
);

router.get(
  "/tax-deduction-rules/:id",
  verifyToken,
  verifyAdmin,
  TaxDeductionRuleController.getDeductionRuleById,
);

router.post(
  "/tax-deduction-rules",
  verifyToken,
  verifyAdmin,
  TaxDeductionRuleController.createDeductionRule,
);

router.patch(
  "/tax-deduction-rules/:id",
  verifyToken,
  verifyAdmin,
  TaxDeductionRuleController.updateDeductionRule,
);

router.patch(
  "/tax-deduction-rules/:id/status",
  verifyToken,
  verifyAdmin,
  TaxDeductionRuleController.updateDeductionRuleStatus,
);

module.exports = router;