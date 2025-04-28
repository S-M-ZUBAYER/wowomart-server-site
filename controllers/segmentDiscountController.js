// controllers/segmentDiscountController.js
const segmentDiscountSchema = require('../schemas/segmentDiscountSchema');
const SegmentDiscount = require('../models/segmentDiscountModel');

exports.createSegment = async (req, res) => {
    const { error } = segmentDiscountSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            result: error.details[0].message
        });
    }

    try {
        const result = await SegmentDiscount.create(req.body);
        res.status(201).json({
            status: 201,
            result: "Segment created successfully",
            data: result
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: "Error creating segment",
            error: err.message
        });
    }
};


exports.getAllSegments = async (req, res) => {
    try {
        const segments = await SegmentDiscount.getAll();
        res.status(200).json({
            status: 200,
            result: segments
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: "Error fetching segments",
            error: err.message
        });
    }
};

exports.getSegmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const segment = await SegmentDiscount.getById(id);
        if (!segment) {
            return res.status(404).json({
                status: 404,
                result: "Segment not found"
            });
        }

        res.status(200).json({
            status: 200,
            result: segment
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: "Error fetching segment",
            error: err.message
        });
    }
};

exports.updateSegmentById = async (req, res) => {
    const { id } = req.params;
    const { error } = segmentDiscountSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: 400,
            result: error.details[0].message
        });
    }

    try {
        const updated = await SegmentDiscount.update(id, req.body);

        if (updated.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                result: "Segment not found"
            });
        }

        res.status(200).json({
            status: 200,
            result: "Segment updated successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: "Error updating segment",
            error: err.message
        });
    }
};


exports.deleteSegmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await SegmentDiscount.remove(id);

        if (deleted.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                result: "Segment not found"
            });
        }

        res.status(200).json({
            status: 200,
            result: "Segment deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            result: "Error deleting segment",
            error: err.message
        });
    }
};
