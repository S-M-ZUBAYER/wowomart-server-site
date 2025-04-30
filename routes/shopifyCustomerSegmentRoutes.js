const express = require('express');
const {
    getCustomerInfo,
    listCustomers,
} = require('../controllers/shopifyCustomerController');

const {
    updateTags,
    createDiscount,
    createDiscountForSegment,
    getAllSegmentDiscounts,
    getSegmentDiscountById,
    getCouponsByTag,
    deleteDiscountController
} = require('../controllers/shopifyDiscountController');

const router = express.Router();

router.post('/shopify/update', updateTags);
router.post('/shopify/segment-discount', createDiscountForSegment);
router.post('/shopify/create-discount', createDiscount);
router.get('/shopify/customer/:customerId', getCustomerInfo);
router.get('/shopify/customers', listCustomers);
// GET all segment discounts
router.get('/shopify/segment-discounts', getAllSegmentDiscounts);

// GET a specific segment discount by ID
router.get('/shopify/segment-discounts/:id', getSegmentDiscountById);

router.get('/shopify/coupons-by-tag', getCouponsByTag);
router.post('/shopify/discount/delete', deleteDiscountController);


module.exports = router;

