const poolNew = require('../config/db');

const SegmentDiscount = {
    create: (data) => {
        return new Promise((resolve, reject) => {
            const { value, label, ApiUrl } = data;
            poolNew.query(
                'INSERT INTO segment_discounts (value, label, ApiUrl) VALUES (?, ?, ?)',
                [value, label, ApiUrl],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    },

    getAll: () => {
        return new Promise((resolve, reject) => {
            poolNew.query('SELECT * FROM segment_discounts', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            poolNew.query('SELECT * FROM segment_discounts WHERE id = ?', [id], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]); // return the single object
            });
        });
    },

    update: (id, data) => {
        return new Promise((resolve, reject) => {
            const { value, label, ApiUrl } = data;
            poolNew.query(
                'UPDATE segment_discounts SET value = ?, label = ?, ApiUrl = ? WHERE id = ?',
                [value, label, ApiUrl, id],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    },

    remove: (id) => {
        return new Promise((resolve, reject) => {
            poolNew.query('DELETE FROM segment_discounts WHERE id = ?', [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
};

module.exports = SegmentDiscount;

