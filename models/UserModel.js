const poolNew = require('../config/db');

const createUser = (name, email, hashedPassword, phone) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO wowomartUser (name, email, password,phone) VALUES (?, ?, ?,?)';
        poolNew.query(query, [name, email, hashedPassword, phone], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, name, email });
        });
    });
};

const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM wowomartUser WHERE email = ?';
        poolNew.query(query, [email], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

const getAllWowomartUsers = () => {
    return new Promise((resolve, reject) => {
        poolNew.query('SELECT * FROM wowomartUser', (err, results) => {
            if (err) return reject(err);
            const sanitizedResults = results.map(user => {
                const { password, ...rest } = user;
                return rest;
            });
            resolve(sanitizedResults);
        });
    });
};


const getByIdWowomartUser = (id) => {
    return new Promise((resolve, reject) => {
        poolNew.query('SELECT * FROM wowomartUser WHERE id = ?', [id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject({ status: 404, message: 'User not found' });

            const { password, ...rest } = results[0];
            resolve(rest);
        });
    });
};


module.exports = {
    createUser,
    findUserByEmail,
    getAllWowomartUsers,
    getByIdWowomartUser
};
