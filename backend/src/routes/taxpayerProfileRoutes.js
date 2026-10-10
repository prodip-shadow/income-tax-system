const express = require("express");

const verifyToken = require("../middleware/verifyToken");
const TaxpayerProfileController = require("../controllers/taxpayerProfileController");

const router = express.Router();

router.post("/", verifyToken, TaxpayerProfileController.createProfile);

router.get("/", verifyToken, TaxpayerProfileController.getProfile);

router.put("/", verifyToken, TaxpayerProfileController.updateProfile);

module.exports = router;
