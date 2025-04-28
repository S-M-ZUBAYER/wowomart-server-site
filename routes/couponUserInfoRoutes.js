const express = require('express');
const router = express.Router();
const controller = require('../controllers/couponUserInfoController');

router.get('/allUser', controller.getAllUsers);
router.get('/user/:id', controller.getUserById);
router.post('/user/create', controller.createUser);
router.put('/user/update/:id', controller.updateUser);
router.delete('/user/delete/:id', controller.deleteUser);

module.exports = router;
