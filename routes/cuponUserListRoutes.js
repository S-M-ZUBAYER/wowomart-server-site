// routes/couponUserList.routes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponUserListController');

// Routes
router.post('/shopify/couponUserList/create', couponController.createCoupon);
router.get('/shopify/allCouponUserList', couponController.getAllCoupons);
router.get('/shopify/couponUserList/:id', couponController.getCouponById);
router.put('/shopify/couponUserList/update/:id', couponController.updateCoupon);
router.delete('/shopify/couponUserList/:id', couponController.deleteCoupon);
router.post('/shopify/deleteAndUpdate', couponController.removeWithUpdate);

module.exports = router;
