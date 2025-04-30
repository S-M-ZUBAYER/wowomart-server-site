const poolNew = require('../config/db'); // adjust path as needed

const shopifyDiscountModel = {
    // Fetch all segment discounts
    getAllSegmentDiscounts: () => {
        return new Promise((resolve, reject) => {
            poolNew.query(
                `SELECT * FROM wowomart_segment_discount_create ORDER BY id DESC`,
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                }
            );
        });
    },

    // Fetch a single segment discount by ID
    getSegmentDiscountById: (id) => {
        return new Promise((resolve, reject) => {
            poolNew.query(
                `SELECT * FROM wowomart_segment_discount_create WHERE id = ?`,
                [id],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results[0]); // return only the first object
                }
            );
        });
    },

    getByTag: () => {
        return new Promise((resolve, reject) => {
            poolNew.query(
                `SELECT * FROM wowomart_segment_discount_create WHERE tag IS NOT NULL AND tag != ''`,
                (err, results) => {
                    if (err) return reject({ status: 500, message: err.message });
                    resolve({ status: 200, result: results, message: 'Fetched coupon users with non-empty tags successfully.' });
                }
            );
        });
    },
};

module.exports = shopifyDiscountModel;
