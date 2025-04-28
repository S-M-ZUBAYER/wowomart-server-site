const poolNew = require('../config/db');

const DiscountPercent = {
    create: (data) => {
        return new Promise((resolve, reject) => {
            const { value, label } = data;
            poolNew.query(
                'INSERT INTO discount_percent (value, label) VALUES (?, ?)',
                [value, label],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    },

    getAll: () => {
        return new Promise((resolve, reject) => {
            poolNew.query('SELECT * FROM discount_percent', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            poolNew.query('SELECT * FROM discount_percent WHERE id = ?', [id], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
    },

    update: (id, data) => {
        const { value, label } = data;
        return new Promise((resolve, reject) => {
            poolNew.query(
                'UPDATE discount_percent SET value = ?, label = ? WHERE id = ?',
                [value, label, id],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    },

    remove: (id) => {
        return new Promise((resolve, reject) => {
            poolNew.query('DELETE FROM discount_percent WHERE id = ?', [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
};

module.exports = DiscountPercent;
