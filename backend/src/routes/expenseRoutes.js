const express = require("express");

const router = express.Router();

const ExpenseController = require("../controllers/expenseController");

const verifyToken = require("../middleware/verifyToken");

// expense types

// get all active expense types
// get /api/expense/types
// get /api/expense/types?category=business
// get /api/expense/types?category=personal

router.get("/types", verifyToken, ExpenseController.getExpenseTypes);

// get single expense type
// get /api/expense/types/20

router.get("/types/:id", verifyToken, ExpenseController.getExpenseTypeById);

// expense summary

// total expense
// get /api/expense/total

router.get("/total", verifyToken, ExpenseController.getTotalExpense);

// allowable business expense
// get /api/expense/allowable-business-expense
// ?start_date=2026-07-01&end_date=2027-06-30

router.get(
  "/allowable-business-expense",
  verifyToken,
  ExpenseController.getAllowableBusinessExpense,
);

// expense crud

// post /api/expense

router.post("/", verifyToken, ExpenseController.createExpense);

// get my expenses
// get /api/expense

router.get("/", verifyToken, ExpenseController.getMyExpense);

// get single expense
// get /api/expense/:id

router.get("/:id", verifyToken, ExpenseController.getExpenseById);

// put /api/expense/:id

router.put("/:id", verifyToken, ExpenseController.updateExpense);

// delete
// delete /api/expense/:id

router.delete("/:id", verifyToken, ExpenseController.deleteExpense);

module.exports = router;
