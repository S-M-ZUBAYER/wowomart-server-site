const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
require("dotenv").config();

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.createUser(name, email, hashedPassword, phone);

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findUserByEmail(email);
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        //     expiresIn: process.env.JWT_EXPIRES_IN,
        // });

        res.status(200).json({
            message: "Login successful",
            // token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getWowomartAllUsers = async (req, res) => {
    try {
        const users = await User.getAllWowomartUsers();
        res.status(200).json({ status: 200, message: 'Users fetched successfully', result: users });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getWowomartUserById = async (req, res) => {
    try {
        const user = await User.getByIdWowomartUser(req.params.id);
        res.status(200).json({ status: 200, message: 'User fetched successfully', result: user });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ status, message: error.message });
    }
};