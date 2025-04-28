const CouponManagement = require('../models/couponManagementModel');

exports.getAllCoupons = async (req, res) => {
    try {
        const result = await CouponManagement.getAll();
        res.status(200).json({ status: 200, result });
    } catch (err) {
        res.status(400).json({ status: 400, error: err.message });
    }
};


exports.getCouponById = async (req, res) => {
    try {
        const result = await CouponManagement.getById(req.params.id);
        if (!result) {
            res.status(200).json({ status: 200, result: "Don't Have This Coupon" });
        }
        res.status(200).json({ status: 200, result });
    } catch (err) {
        res.status(400).json({ status: 400, error: err.message });
    }
};


exports.createCoupon = async (req, res) => {
    try {
        const result = await CouponManagement.create(req.body);
        res.status(200).json({ status: 200, result: "Create New Coupon Successfully" });
    } catch (err) {
        res.status(400).json({ status: 400, error: err.message });
    }
};


exports.updateCoupon = async (req, res) => {
    try {
        const result = await CouponManagement.update(req.params.id, req.body);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                result: "Coupon with this ID not found",
            });
        }

        res.status(200).json({
            status: 200,
            result: "Coupon Updated Successfully",
        });
    } catch (err) {
        res.status(400).json({
            status: 400,
            error: err.message,
        });
    }
};



exports.deleteCoupon = async (req, res) => {
    try {
        const result = await CouponManagement.remove(req.params.id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                result: "Coupon with this ID not found",
            });
        }

        res.status(200).json({
            status: 200,
            result: "Delete This Coupon Successfully",
        });
    } catch (err) {
        res.status(400).json({
            status: 400,
            error: err.message,
        });
    }
};

