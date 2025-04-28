const express = require('express');
const router = express.Router();
const segmentController = require('../controllers/segmentDiscountController');

// Create
router.post('/segmentDiscount/create', segmentController.createSegment);

// Get All
router.get('/allSegmentDiscount', segmentController.getAllSegments);

// Get By ID
router.get('/segmentDiscount/:id', segmentController.getSegmentById);

// Update By ID
router.put('/segmentDiscount/update/:id', segmentController.updateSegmentById);

// Delete By ID
router.delete('/segmentDiscount/delete/:id', segmentController.deleteSegmentById);

module.exports = router;
