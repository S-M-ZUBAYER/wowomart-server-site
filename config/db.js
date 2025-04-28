// const mysql = require("mysql");
// require("dotenv").config();

// // Create a connection pool with MySQL
// const poolNew = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_Port,
//     connectionLimit: 10, // Maximum number of connections in the pool
//     waitForConnections: true, // Queue connection requests if all are in use
//     queueLimit: 0, // No limit to the number of queued requests
// });


// // Export the pool to use in other parts of your application
// module.exports = poolNew;


const mysql = require("mysql");
require("dotenv").config();

// Create a connection pool with MySQL
// const pool = mysql.createPool({
//     host: process.env.DBHost,
//     user: process.env.DBUser,
//     password: process.env.DBPassword,
//     database: process.env.DBName,
//     port: process.env.DBPort,
//     connectionLimit: 10, // Maximum number of connections in the pool
//     waitForConnections: true, // Queue connection requests if all are in use
//     queueLimit: 0, // No limit to the number of queued requests
// });

// Create a connection poolNew with MySQL
const poolNew = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // ⚡ Here you wrote DB_Port (wrong case) before, fixed to DB_PORT
    connectionLimit: 10, // Maximum number of connections in the pool
    waitForConnections: true, // Queue connection requests if all are in use
    queueLimit: 0, // No limit to the number of queued requests
});

// Export the pools
module.exports = poolNew;
