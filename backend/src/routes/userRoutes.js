const express = require("express");

const router = express.Router();

const UserController = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/email/:email", verifyToken, verifyAdmin, UserController.getUserByEmail);
router.get("/phone/:phone", verifyToken, verifyAdmin, UserController.getUserByPhone);
router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.get("/profile", verifyToken, UserController.getProfile);

module.exports = router;