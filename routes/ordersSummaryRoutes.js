const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const poolNew = require('../config/db');

const upload = multer({ dest: 'uploads/' });

router.post('/shopify/upload-csv', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = path.resolve(req.file.path);
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const email = row['Email'];
            const name = row['Name'];
            const financialStatus = (row['Financial Status'] || '').toLowerCase();
            const currency = row['Currency'];
            const fulfilledAt = row['Fulfilled at'];
            const subtotal = parseFloat(row['Subtotal'] || 0);
            const shipping = parseFloat(row['Shipping'] || 0);
            const total = parseFloat(row['Total'] || 0);
            const lineQty = parseInt(row['Lineitem quantity'] || 0);

            if (email && financialStatus === 'paid') {
                results.push({ name, email, currency, fulfilledAt, subtotal, shipping, total, lineQty });
            }
        })
        .on('end', () => {
            processRowsSequentially(results, 0, filePath, res);
        });
});

function processRowsSequentially(rows, index, filePath, res) {
    if (index >= rows.length) {
        fs.unlinkSync(filePath); // Delete uploaded file
        return res.status(200).json({ message: 'CSV processed successfully.' });
    }

    const data = rows[index];

    poolNew.query('SELECT * FROM customer_order_summary WHERE email = ?', [data.email], (err, result) => {
        if (err) {
            fs.unlinkSync(filePath);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (result.length > 0) {
            // Update existing
            poolNew.query(
                `UPDATE customer_order_summary SET 
                    subtotal = subtotal + ?,
                    shipping = shipping + ?,
                    total = total + ?,
                    lineitem_quantity = lineitem_quantity + ?,
                    last_fulfilled_at = ?
                 WHERE email = ?`,
                [data.subtotal, data.shipping, data.total, data.lineQty, data.fulfilledAt, data.email],
                (updateErr) => {
                    if (updateErr) {
                        fs.unlinkSync(filePath);
                        return res.status(500).json({ message: 'Update error', error: updateErr });
                    }
                    processRowsSequentially(rows, index + 1, filePath, res);
                }
            );
        } else {
            // Insert new
            poolNew.query(
                `INSERT INTO customer_order_summary 
                (name, email, currency, subtotal, shipping, total, lineitem_quantity, last_fulfilled_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [data.name, data.email, data.currency, data.subtotal, data.shipping, data.total, data.lineQty, data.fulfilledAt],
                (insertErr) => {
                    if (insertErr) {
                        fs.unlinkSync(filePath);
                        return res.status(500).json({ message: 'Insert error', error: insertErr });
                    }
                    processRowsSequentially(rows, index + 1, filePath, res);
                }
            );
        }
    });
}

module.exports = router;
