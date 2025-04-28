const CouponUserInfo = require('../models/couponUserInfoModel');

exports.getAllUsers = async (req, res) => {
    try {
        const result = await CouponUserInfo.getAll();
        const rows = Array.isArray(result) ? result : [];
        res.status(200).json({ status: 200, result: rows });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const result = await CouponUserInfo.getById(req.params.id);
        if (!result) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        res.status(200).json({ status: 200, result: result });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const result = await CouponUserInfo.create(req.body);
        res.status(201).json({ status: 201, result: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ status: 400, message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const result = await CouponUserInfo.update(req.params.id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        res.status(200).json({ status: 200, message: 'User updated successfully' });
    } catch (err) {
        res.status(400).json({ status: 400, message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const result = await CouponUserInfo.remove(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        res.status(200).json({ status: 200, message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ status: 400, message: err.message });
    }
};
