const poolNew = require('../config/db'); // Ensure correct path to your db config

const CouponUserInfo = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT 
                u.*, 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'cause_name', c.cause_name,
                        'description', c.description
                    )
                ) AS causes
            FROM coupon_user_info u
            LEFT JOIN coupon_cause c ON u.id = c.user_id
            GROUP BY u.id
        `;

            poolNew.query(query, (err, results) => {
                if (err) return reject(err);
                // Convert causes from string to array
                const formattedResults = results.map(user => ({
                    ...user,
                    causes: JSON.parse(user.causes)
                }));
                resolve(formattedResults);
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT 
                u.*, 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'cause_name', c.cause_name,
                        'description', c.description
                    )
                ) AS causes
            FROM coupon_user_info u
            LEFT JOIN coupon_cause c ON u.id = c.user_id
            WHERE u.id = ?
            GROUP BY u.id
        `;

            poolNew.query(query, [id], (err, results) => {
                if (err) return reject(err);
                if (!results[0]) return resolve(null);
                const user = results[0];
                user.causes = JSON.parse(user.causes);
                resolve(user);
            });
        });
    },



    create: (data) => {
        const {
            user_name,
            user_email,
            user_country,
            account_duration,
            user_id,
            tag_name,
            discount,
            coupon_code,
            coupon_title,
            expire_time,
            causes = []
        } = data;

        return new Promise((resolve, reject) => {
            poolNew.getConnection((err, connection) => {
                if (err) return reject(err);

                connection.beginTransaction(async (err) => {
                    if (err) {
                        connection.release();
                        return reject(err);
                    }

                    const userSql = `
                    INSERT INTO coupon_user_info 
                    (user_name, user_email, user_country, account_duration, user_id, tag_name, discount, coupon_code, coupon_title, expire_time)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                    const userValues = [
                        user_name,
                        user_email,
                        user_country,
                        account_duration,
                        user_id,
                        tag_name,
                        discount,
                        coupon_code,
                        coupon_title,
                        expire_time
                    ];

                    connection.query(userSql, userValues, (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                reject(err);
                            });
                        }

                        const newUserId = result.insertId;

                        const causeInserts = causes.map(cause => {
                            return new Promise((res, rej) => {
                                connection.query(
                                    'INSERT INTO coupon_cause (cause_name, description, user_id) VALUES (?, ?, ?)',
                                    [cause.cause_name, cause.description || null, newUserId],
                                    (err, result) => {
                                        if (err) return rej(err);
                                        res(result);
                                    }
                                );
                            });
                        });

                        Promise.all(causeInserts)
                            .then(() => {
                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(err);
                                        });
                                    }
                                    connection.release();
                                    resolve({
                                        message: 'User and causes added successfully',
                                        userId: newUserId
                                    });
                                });
                            })
                            .catch(err => {
                                connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            });
                    });
                });
            });
        });
    },



    update: (id, data) => {
        const {
            user_name,
            user_email,
            user_country,
            account_duration,
            user_id,
            tag_name,
            discount,
            coupon_code,
            coupon_title,
            expire_time,
            causes = [] // Array of { name, description }
        } = data;

        return new Promise((resolve, reject) => {
            poolNew.getConnection((err, connection) => {
                if (err) return reject(err);

                connection.beginTransaction(err => {
                    if (err) {
                        connection.release();
                        return reject(err);
                    }

                    const updateUserSql = `
                    UPDATE coupon_user_info 
                    SET user_name=?, user_email=?, user_country=?, account_duration=?, user_id=?, tag_name=?, discount=?, coupon_code=?, coupon_title=?, expire_time=?
                    WHERE id=?
                `;
                    const updateUserValues = [
                        user_name,
                        user_email,
                        user_country,
                        account_duration,
                        user_id,
                        tag_name,
                        discount,
                        coupon_code,
                        coupon_title,
                        expire_time,
                        id
                    ];

                    connection.query(updateUserSql, updateUserValues, (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                reject(err);
                            });
                        }

                        // First delete existing causes
                        connection.query('DELETE FROM coupon_cause WHERE user_id = ?', [id], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }

                            // Then insert updated causes
                            const causeInserts = causes.map(cause => {
                                return new Promise((res, rej) => {
                                    connection.query(
                                        'INSERT INTO coupon_cause (cause_name, description, user_id) VALUES (?, ?, ?)',
                                        [cause.name, cause.description || null, id],
                                        (err, result) => {
                                            if (err) return rej(err);
                                            res(result);
                                        }
                                    );
                                });
                            });

                            Promise.all(causeInserts)
                                .then(() => {
                                    connection.commit(err => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                reject(err);
                                            });
                                        }
                                        connection.release();
                                        resolve({ message: 'User and causes updated successfully' });
                                    });
                                })
                                .catch(err => {
                                    connection.rollback(() => {
                                        connection.release();
                                        reject(err);
                                    });
                                });
                        });
                    });
                });
            });
        });
    },


    remove: (id) => {
        return new Promise((resolve, reject) => {
            poolNew.getConnection((err, connection) => {
                if (err) return reject(err);

                connection.beginTransaction(err => {
                    if (err) {
                        connection.release();
                        return reject(err);
                    }

                    // First delete from coupon_cause
                    connection.query('DELETE FROM coupon_cause WHERE user_id = ?', [id], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                reject(err);
                            });
                        }

                        // Then delete from coupon_user_info
                        connection.query('DELETE FROM coupon_user_info WHERE id = ?', [id], (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }

                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        reject(err);
                                    });
                                }
                                connection.release();
                                resolve({ message: 'User and related causes deleted successfully', result });
                            });
                        });
                    });
                });
            });
        });
    },

};

module.exports = CouponUserInfo;

