

const express = require('express');
const connection = require('../config/db'); // Ensure the path to your DB config is correct
const pool = require('../config/db');
const router = express.Router();
const nodemailer = require('nodemailer');

// Utility function to handle errors
const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

const queryDatabase = (query, params) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,  // or use 587
    secure: true,  // use `false` for port 587
    auth: {
        user: "yingdanong765@gmail.com",
        pass: "printernoble.com"  // Make sure this is correct
    }
});


// Function to send an email
const sendMail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"S M Zubayer" business@wowomart.com', // Sender address
            to, // Receiver email
            subject, // Subject line
            text, // Plain text body
            // html // HTML body (optional)
        });

        console.log("Email sent: ", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};


router.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await sendMail(to, subject, text);

    if (response.success) {
        res.json({ message: "Email sent successfully", messageId: response.messageId });
    } else {
        res.status(500).json({ error: "Failed to send email", details: response.error });
    }
});


// POST: Add a new MultiVendor payment record
router.post('/multiVendorPaymentInfo/apply', async (req, res) => {
    const { email, amount, paymentId, Duration, currency, purpose } = req.body;
    const paymentTime = new Date();

    // Validation for required fields
    if (!email || !amount || !paymentId || !Duration || !currency || !purpose) {
        return res.status(400).json({
            statusCode: 400,
            status: "failed",
            message: "email, amount, paymentId, Duration, currency, and purpose are required"
        });
    }

    try {
        const query = `
            INSERT INTO multiVendorPaymentInfo (email, paymentStatus, amount, paymentTime, Duration, currency, account_creation_status,subscriptionStatus, purpose, paymentId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await queryDatabase(query, [email, true, amount, paymentTime, Duration, currency, false, true, purpose, paymentId]);

        res.status(201).json({
            statusCode: 201,
            status: "success",
            message: "MultiVendor payment info added successfully"
        });
    } catch (error) {
        console.error('Error adding MultiVendor payment info:', error);
        res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error"
        });
    }
});


router.put("/multiVendorPaymentInfo/update", async (req, res) => {
    const { amount, email, currency, purpose, Duration, paymentId, paymentTime, paymentStatus, account_creation_status, disableStatus } = req.body;
    console.log({ amount, email, currency, purpose, Duration, paymentId, paymentTime, paymentStatus, account_creation_status, disableStatus });

    // Validate request body
    if (!amount || !email || !currency || !purpose || !Duration || !paymentId || !paymentTime || !account_creation_status || !paymentStatus || !disableStatus) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Amount, email, currency, duration, paymentId, paymentTime, account_creation_status, paymentStatus,disableStatus and purpose are required"
        });
    }

    try {
        const updateQuery = `
            UPDATE multiVendorPaymentInfo
            SET amount = ?, currency = ?, account_creation_status = ?, paymentTime = ?, purpose = ?, Duration = ?, paymentId = ?, paymentStatus = ?, subscriptionStatus=?,disableStatus=?
            WHERE email = ?
        `;

        const result = await queryDatabase(updateQuery, [
            amount, currency, account_creation_status, paymentTime, purpose, Duration, paymentId, paymentStatus, true, disableStatus, email
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No record found for the provided email"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "MultiVendor payment info updated successfully"
        });
    } catch (error) {
        console.error("Error updating MultiVendor payment info:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
});

router.put("/multiVendorPaymentInfo/accountCreationUpdate/:email", async (req, res) => {
    const { email } = req.params;
    const account_creation_status = true;

    // Validate request params
    if (!email) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Email is required"
        });
    }

    try {
        const updateQuery = `
            UPDATE multiVendorPaymentInfo
            SET account_creation_status = ?
            WHERE email = ?
        `;

        const result = await queryDatabase(updateQuery, [account_creation_status, email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No record found for the provided email"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Account creation status updated successfully"
        });
    } catch (error) {
        console.error("Error updating account creation status:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
});

router.put("/multiVendorPaymentInfo/subscriptionStatusUpdate/:email", async (req, res) => {
    const { email } = req.params;
    const subscriptionStatus = true;
    const paymentTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Validate request params
    if (!email) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Email is required"
        });
    }

    try {
        const updateQuery = `
            UPDATE multiVendorPaymentInfo
            SET subscriptionStatus = ?, paymentTime= ?
            WHERE email = ?
        `;

        const result = await queryDatabase(updateQuery, [subscriptionStatus, paymentTime, email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No record found for the provided email"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Account creation status updated successfully"
        });
    } catch (error) {
        console.error("Error updating account creation status:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
});

router.put("/multiVendorPaymentInfo/updateMultipleEmailSubscriptionStatus", async (req, res) => {
    const { emails } = req.body;
    const subscriptionStatus = false;

    // Validate request body
    if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "A non-empty array of emails is required"
        });
    }

    try {
        const placeholders = emails.map(() => "?").join(", ");
        const updateQuery = `
            UPDATE multiVendorPaymentInfo
            SET subscriptionStatus = ?
            WHERE email IN (${placeholders})
        `;

        const result = await queryDatabase(updateQuery, [subscriptionStatus, ...emails]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No records found for the provided emails"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Subscription status updated successfully for provided emails"
        });
    } catch (error) {
        console.error("Error updating subscription status:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
});

router.put("/multiVendorPaymentInfo/updateDisableStatus/:id", async (req, res) => {
    const { disableStatus } = req.body;
    const { id } = req.params;

    if (disableStatus === undefined) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "disableStatus is required"
        });
    }

    try {
        const updateQuery = `
            UPDATE multiVendorPaymentInfo
            SET disableStatus = ?
            WHERE id = ?
        `;

        const result = await queryDatabase(updateQuery, [disableStatus, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No record found for the provided ID"
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "Disable status updated successfully"
        });
    } catch (error) {
        console.error("Error updating disable status:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
});




// GET: Fetch all MultiVendor payments
router.get('/multiVendorPaymentInfo/all', async (req, res) => {
    const query = 'SELECT * FROM multiVendorPaymentInfo';

    try {
        const results = await queryDatabase(query, []);

        res.status(200).json({
            status: 200,
            success: true,
            message: "MultiVendor payment data fetched successfully",
            data: results
        });
    } catch (error) {
        console.error('Error fetching MultiVendor payment data:', error);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error",
            data: []
        });
    }
});

router.get('/multiVendorInfo/:id', async (req, res) => {
    console.log();

    const { id } = req.params;
    const query = 'SELECT * FROM multiVendorPaymentInfo WHERE id = ?';

    try {
        const results = await queryDatabase(query, [id]);

        // Check if results exist and extract the correct data
        if (!results || results.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "MultiVendor payment record not found",
                total: 0,
                data: null
            });
        }

        // If your DB driver returns results as an array of rows, use results[0]
        const record = Array.isArray(results[0]) ? results[0][0] : results[0];

        console.log("Fetched Data:", record);

        if (!record) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "MultiVendor payment record not found",
                total: 0,
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "MultiVendor payment record fetched successfully",
            total: 1, // Since ID is unique, total will always be 1
            data: results
        });

    } catch (error) {
        console.error('Error fetching MultiVendor PaymentInfo payment by ID:', error);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error",
            total: 0,
            data: null
        });
    }
});
// GET: Retrieve multiVendor payment info by email
router.get('/multiVendorPaymentInfo/:email', async (req, res) => {
    const email = req.params.email;
    const query = 'SELECT * FROM multiVendorPaymentInfo WHERE email = ?';

    try {
        const results = await queryDatabase(query, [email]);
        if (results.length === 1) {
            res.json(results[0]);
        } else {
            res.send({
                email: email,
                paymentStatus: 0
            });
        }
    } catch (error) {
        console.error('Error retrieving crop payment info:', error);
        res.status(500).send('Internal Server Error');
    }
});

// DELETE: Remove a payment record by ID
router.delete('/multiVendorInfo/delete/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM multiVendorPaymentInfo WHERE id = ?';

    try {
        const result = await queryDatabase(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "MultiVendor payment record not found",
                total: 0
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "MultiVendor payment record deleted successfully",
            total: 1
        });

    } catch (error) {
        console.error('Error deleting MultiVendor PaymentInfo record:', error);

        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error",
            total: 0
        });
    }
});



// POST request to add data for MultiVendor payment

router.get('/multiVendorPackage/amount', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.packageName, p.Duration, p.allowMark, p.USD, p.EUR, p.SGD, p.CNY,
                f.feature
            FROM 
                multiVendorPaymentAmount p
            LEFT JOIN 
                multiVendorPackageFeatures f ON p.id = f.package_id
        `;
        const result = await queryDatabase(query);

        if (!result || result.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'No records found',
                total: 0,
                data: []
            });
        }

        // Organize data into the desired structure
        const packages = result.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    id: row.id,
                    packageName: row.packageName,
                    Duration: row.Duration,
                    allowMark: row.allowMark,
                    currency: {
                        USD: row.USD,
                        EUR: row.EUR,
                        SGD: row.SGD,
                        CNY: row.CNY
                    },
                    features: []
                };
            }
            if (row.feature) {
                acc[row.id].features.push(row.feature);
            }
            return acc;
        }, {});

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Records retrieved successfully',
            total: Object.keys(packages).length,
            data: Object.values(packages)
        });

    } catch (error) {
        console.error('Error retrieving MultiVendor PaymentInfo records:', error);

        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while fetching the records',
            total: 0,
            data: null
        });
    }
});

router.get('/multiVendorPaymentInfo/amount/:packageName', async (req, res) => {
    const { packageName } = req.params;

    try {
        const query = `
            SELECT 
                m.id, m.packageName, m.USD, m.EUR, m.SGD, m.CNY, m.Duration, m.allowMark, f.feature
            FROM 
                multiVendorPaymentAmount m
            LEFT JOIN 
                multivendorpackagefeatures f ON m.id = f.package_id
            WHERE 
                m.packageName = ?
        `;
        const result = await queryDatabase(query, [packageName]);

        if (!result || result.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'No record found for the provided packageName',
                total: 0,
                data: null
            });
        }

        // Extracting and restructuring the first record
        const record = result[0];
        const formattedData = {
            id: record.id,
            packageName: record.packageName,
            Duration: record.Duration,
            allowMark: record.allowMark,
            currency: {
                USD: record.USD,
                EUR: record.EUR,
                SGD: record.SGD,
                CNY: record.CNY
            },
            features: result.filter(row => row.feature).map(row => row.feature)
        };

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Data retrieved successfully',
            total: 1,
            data: formattedData
        });

    } catch (error) {
        console.error('Error retrieving data:', error);

        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while retrieving the record',
            total: 0,
            data: null
        });
    }
});

router.post('/multiVendorPaymentInfo/amount', async (req, res) => {
    const { packageName, USD, EUR, SGD, CNY, Duration, allowMark, features } = req.body;

    // Validate input
    if (!packageName || isNaN(USD) || isNaN(EUR) || isNaN(SGD) || isNaN(CNY) || isNaN(Duration) || isNaN(allowMark) || !Array.isArray(features)) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Invalid input: All currency values, Duration, and allowMark must be numbers. Features must be an array.',
            total: 0,
            data: null
        });
    }

    const paymentQuery = `INSERT INTO multiVendorPaymentAmount (packageName, USD, EUR, SGD, CNY, Duration, allowMark) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    try {
        // Insert payment details
        const paymentResult = await queryDatabase(paymentQuery, [packageName, USD, EUR, SGD, CNY, Duration, allowMark]);

        if (!paymentResult || paymentResult.affectedRows === 0) {
            return res.status(500).json({
                status: 500,
                success: false,
                message: 'Failed to add MultiVendor payment record',
                total: 0,
                data: null
            });
        }

        const packageId = paymentResult.insertId;

        // Insert features into multiVendorPaymentFeatures table
        const featureQuery = `INSERT INTO multiVendorPackageFeatures (package_id, feature) VALUES (?, ?)`;
        for (const feature of features) {
            await queryDatabase(featureQuery, [packageId, feature]);
        }

        res.status(201).json({
            status: 201,
            success: true,
            message: 'MultiVendor payment record added successfully with features',
            total: 1,
            data: {
                id: packageId,
                packageName,
                currency: { USD, EUR, SGD, CNY },
                Duration,
                allowMark,
                features
            }
        });

    } catch (error) {
        console.error('Error adding MultiVendor PaymentInfo record:', error);

        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while adding the record',
            total: 0,
            data: null
        });
    }
});

router.put('/multiVendorPaymentInfo/amount/update/:packageName', async (req, res) => {
    const { packageName } = req.params;
    const { USD, EUR, SGD, CNY, Duration, allowMark, features } = req.body;

    // Input validation
    if (
        [USD, EUR, SGD, CNY, Duration, allowMark].some(value => value === undefined || value === null || isNaN(value)) ||
        !Array.isArray(features)
    ) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Invalid input: Currency values, Duration, and allowMark must be valid numbers; features must be an array.',
            total: 0,
            data: null
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const query = `
            UPDATE multiVendorPaymentAmount 
            SET USD = ?, EUR = ?, SGD = ?, CNY = ?, Duration = ?, allowMark = ?
            WHERE packageName = ?
        `;
        const [result] = await connection.query(query, [USD, EUR, SGD, CNY, Duration, allowMark, packageName]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'No record found for the provided packageName',
                total: 0,
                data: null
            });
        }

        // Delete existing features
        const deleteFeaturesQuery = `DELETE FROM multiVendorPackageFeatures WHERE package_id = ?`;
        await connection.query(deleteFeaturesQuery, [packageName]);

        // Insert new features
        const insertFeatureQuery = `INSERT INTO multiVendorPackageFeatures (package_id, feature) VALUES (?, ?)`;
        for (const feature of features) {
            await connection.query(insertFeatureQuery, [packageName, feature]);
        }

        await connection.commit();

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Record and features updated successfully',
            total: 1,
            data: { packageName, USD, EUR, SGD, CNY, Duration, allowMark, features }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error during database update:', error);
        res.status(500).json({
            status: 500,
            success: false,
            message: 'An error occurred while updating the record',
            total: 0,
            data: null
        });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;

