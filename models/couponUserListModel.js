// models/CouponUserList.js
const poolNew = require('../config/db');

// Function to convert ISO date to the required format
const convertDateFormat = (isoDate, newMonth, newDay) => {
    const date = new Date(isoDate); // Convert the ISO string to a Date object

    // Manually set new month and day (adjust the month and day if necessary)
    date.setMonth(newMonth - 1); // Months are 0-based in JavaScript
    date.setDate(newDay);

    // Extract the components and format them as needed
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two digits
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Format the date
};

const CouponUserListModel = {
    // Get All Coupons
    getAll: () => {
        return new Promise((resolve, reject) => {
            poolNew.query('SELECT * FROM coupon_user_list', (err, results) => {
                if (err) return reject({ status: 500, message: err.message });
                resolve({ status: 200, result: results, message: 'Fetched all coupon users successfully.' });
            });
        });
    },

    // Get Coupon by ID
    getById: (id) => {
        return new Promise((resolve, reject) => {
            poolNew.query('SELECT * FROM coupon_user_list WHERE id = ?', [id], (err, results) => {
                if (err) return reject({ status: 500, message: err.message });
                if (results.length === 0) {
                    return resolve({ status: 404, message: 'Coupon user not found.' });
                }
                resolve({ status: 200, result: results[0], message: 'Fetched coupon user successfully.' });
            });
        });
    },

    // Create a new coupon user
    create: (data) => {
        const {
            title,
            percentage,
            segmentQuery,
            minimumAmount,
            minimumItem,
            code,
            expireDate,
            tag,
            segmentId,
            discountId,
            email,
            customerId,
        } = data;

        // Convert the expireDate before inserting
        const convertedExpireDate = convertDateFormat(expireDate, 5, 31); // Convert date to '2025-05-31 23:59:59'

        return new Promise((resolve, reject) => {
            poolNew.query(
                `INSERT INTO coupon_user_list
                (title, percentage, segmentQuery, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId, email, customerId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, percentage, segmentQuery, minimumAmount, minimumItem, code, convertedExpireDate, tag, segmentId, discountId, email, customerId],
                (err, result) => {
                    if (err) return reject({ status: 500, message: err.message });
                    resolve({ status: 201, result: result, message: 'Coupon user created successfully.' });
                }
            );
        });
    },

    // Update a coupon user
    update: (id, data) => {
        const {
            title,
            percentage,
            segmentQuery,
            minimumAmount,
            minimumItem,
            code,
            expireDate,
            tag,
            segmentId,
            discountId,
            email,
            customerId,
        } = data;

        // Convert the expireDate before updating
        const convertedExpireDate = convertDateFormat(expireDate, 5, 31); // Convert date to '2025-05-31 23:59:59'

        return new Promise((resolve, reject) => {
            poolNew.query(
                `UPDATE coupon_user_list 
                 SET title = ?, percentage = ?, segmentQuery = ?, minimumAmount = ?, minimumItem = ?, 
                     code = ?, expireDate = ?, tag = ?, segmentId = ?, discountId = ?, email = ?, customerId = ?
                 WHERE id = ?`,
                [title, percentage, segmentQuery, minimumAmount, minimumItem, code, convertedExpireDate, tag, segmentId, discountId, email, customerId, id],
                (err, result) => {
                    if (err) return reject({ status: 500, message: err.message });
                    resolve({ status: 200, result: result, message: 'Coupon user updated successfully.' });
                }
            );
        });
    },

    // Delete a coupon user
    remove: (id) => {
        return new Promise((resolve, reject) => {
            poolNew.query('DELETE FROM coupon_user_list WHERE id = ?', [id], (err, result) => {
                if (err) return reject({ status: 500, message: err.message });
                resolve({ status: 200, result: result, message: 'Coupon user deleted successfully.' });
            });
        });
    },
};

module.exports = CouponUserListModel;
