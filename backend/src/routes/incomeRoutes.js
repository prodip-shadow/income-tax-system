const express = require("express");

const router = express.Router();

const IncomeController = require("../controllers/incomeController");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, IncomeController.createIncome);
router.get("/", verifyToken, IncomeController.getMyIncome);
router.get("/:id", verifyToken, IncomeController.getIncomeById);
router.put("/:id", verifyToken, IncomeController.updateIncome);
router.delete("/:id", verifyToken, IncomeController.deleteIncome);

module.exports = router;
