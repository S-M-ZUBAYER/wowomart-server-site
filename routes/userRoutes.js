const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/shopify/register", userController.register);
router.post("/shopify/login", userController.login);
// router.get('/users', authenticateToken, userController.getAllUsers);
// router.get('/users/:id', authenticateToken, userController.getUserById);
router.get('/shopify/users', userController.getWowomartAllUsers);
router.get('/shopify/users/:id', userController.getWowomartUserById);

module.exports = router;
