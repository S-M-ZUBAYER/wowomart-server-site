const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountPercentController');

// Create
router.post('/discountPercent/create', discountController.createDiscount);

// Get All
router.get('/allDiscountPercent', discountController.getAllDiscounts);

// Get by ID
router.get('/discountPercent/:id', discountController.getDiscountById);

// Update by ID
router.put('/discountPercent/update/:id', discountController.updateDiscountById);

// Delete by ID
router.delete('/discountPercent/delete/:id', discountController.deleteDiscountById);

// Call Post request Delete by ID 
router.post('/discountPercent/delete/:id', discountController.deleteDiscountById);


module.exports = router;
