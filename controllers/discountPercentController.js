const DiscountPercent = require('../models/DiscountPercentModel');
const discountPercentSchema = require('../schemas/discountPercentSchema');

// Create Discount
exports.createDiscount = async (req, res) => {
    const { error } = discountPercentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            result: error.details[0].message
        });
    }

    try {
        const result = await DiscountPercent.create(req.body);
        res.status(201).json({
            status: 201,
            result: 'Discount percent created',
            data: result
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: 'Error creating discount',
            error: err.message || err
        });
    }
};

// Get All
exports.getAllDiscounts = async (req, res) => {
    try {
        const result = await DiscountPercent.getAll();
        res.status(200).json({
            status: 200,
            message: 'Success',
            result
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: 'Error fetching discounts',
            error: err.message || err
        });
    }
};

// Get by ID
exports.getDiscountById = async (req, res) => {
    try {
        const result = await DiscountPercent.getById(req.params.id);
        if (!result) {
            return res.status(404).json({
                status: 404,
                result: 'Discount not found'
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Success',
            result
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: 'Error fetching discount',
            error: err.message || err
        });
    }
};

// Update by ID
exports.updateDiscountById = async (req, res) => {
    const { error } = discountPercentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            result: error.details[0].message
        });
    }

    try {
        const result = await DiscountPercent.update(req.params.id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                result: 'Discount not found'
            });
        }

        res.status(200).json({
            status: 200,
            result: 'Discount updated successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: 'Error updating discount',
            error: err.message || err
        });
    }
};

// Delete by ID
exports.deleteDiscountById = async (req, res) => {
    try {
        const result = await DiscountPercent.remove(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                result: 'Discount not found'
            });
        }

        res.status(200).json({
            status: 200,
            result: 'Discount deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: 'Error deleting discount',
            error: err.message || err
        });
    }
};
