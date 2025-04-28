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
    getCouponsByTag
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


module.exports = router;



// {
//     "success": true,
//         "discount": {
//         "id": "gid://shopify/DiscountCodeNode/1099959959606",
//             "codeDiscount": {
//             "title": "Buy Min Amount, Get 25%",
//                 "codes": {
//                 "nodes": [
//                     {
//                         "code": "RERERER"
//                     }
//                 ]
//             }
//         }


// {
//     "success": true,
//         "segment": {
//         "id": "gid://shopify/Segment/473212354614",
//             "name": "Summer Sale 3000% Segment",
//                 "query": "customer_added_date <= 2025-01-01"
//     },
//     "discount": {
//         "id": "gid://shopify/DiscountCodeNode/1099960254518",
//             "codeDiscount": {
//             "title": "Summer Sale 3000%",
//                 "codes": {
//                 "nodes": [
//                     {
//                         "code": "TTTTER"
//                     }
//                 ]
//             }
//         }
//     }
// }