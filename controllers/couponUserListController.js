// controllers/CouponUserList.controller.js
const CouponUserList = require('../models/couponUserListModel');
const { couponUserListSchema } = require('../schemas/couponUserListSchema'); // 🔥 corrected import name

// Create
exports.createCoupon = async (req, res) => {
    try {
        const { error } = couponUserListSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const result = await CouponUserList.create(req.body);
        res.status(201).json({ status: 201, message: 'Coupon created successfully', result });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};

// Get All
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await CouponUserList.getAll();
        res.status(200).json({ status: 200, message: 'Coupons fetched successfully', result: coupons });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};

// Get By ID
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await CouponUserList.getById(req.params.id);
        if (!coupon) return res.status(404).json({ status: 404, message: 'Coupon not found' });

        res.status(200).json({ status: 200, message: 'Coupon fetched successfully', result: coupon });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};

// Update
exports.updateCoupon = async (req, res) => {
    try {
        const { error } = couponUserListSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const result = await CouponUserList.update(req.params.id, req.body);
        res.status(200).json({ status: 200, message: 'Coupon updated successfully', result });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};

// Delete
exports.deleteCoupon = async (req, res) => {
    try {
        const result = await CouponUserList.remove(req.params.id);
        res.status(200).json({ status: 200, message: 'Coupon deleted successfully', result });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};
