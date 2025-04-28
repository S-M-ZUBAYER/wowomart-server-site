const express = require('express');
const router = express.Router();
const controller = require('../controllers/couponManagementController');

router.get('/allCoupon', controller.getAllCoupons);
router.get('/coupon/:id', controller.getCouponById);
router.post('/coupon/create', controller.createCoupon);
router.put('/coupon/update/:id', controller.updateCoupon);
router.delete('/coupon/delete/:id', controller.deleteCoupon);

module.exports = router;
