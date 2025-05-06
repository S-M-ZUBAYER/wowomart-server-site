const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    const payload = { id: user.id, email: user.email };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d", // token expires in 7 days
    });

    return token;
};
