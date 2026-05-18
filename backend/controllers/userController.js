const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

/* ================= REGISTER USER ================= */

const register = async (req, res, next) => {
    try {

        console.log("REGISTER BODY:", req.body); // Debug log

        const { name, phone, email, password, role } = req.body;

        // Check required fields
        if (!name || !phone || !email || !password || !role) {
            return next(createHttpError(400, "All fields are required!"));
        }

        // Check if user already exists
        const isUserPresent = await User.findOne({ email });

        if (isUserPresent) {
            return next(createHttpError(400, "User already exists with this email!"));
        }

        // Create user
        const newUser = new User({
            name,
            phone,
            email,
            password,
            role
        });

        await newUser.save();

        // Remove password before sending response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "New user created successfully!",
            data: userResponse
        });

    } catch (error) {

        console.log("REGISTER ERROR:", error); // Debug error

        if (error.name === "ValidationError") {

            const messages = Object.values(error.errors)
                .map(err => err.message)
                .join(", ");

            return next(createHttpError(400, messages));
        }

        next(error);
    }
};


/* ================= LOGIN USER ================= */

const login = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return next(createHttpError(400, "Email and password are required!"));
        }

        const user = await User.findOne({ email });

        if (!user) {
            return next(createHttpError(401, "Invalid email or password"));
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return next(createHttpError(401, "Invalid email or password"));
        }

        const accessToken = jwt.sign(
            { _id: user._id },
            config.accessTokenSecret,
            { expiresIn: "1d" }
        );

        // Cookie (fixed for localhost)
        res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "none",
    secure: true
});

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "User logged in successfully!",
            data: userResponse
        });

    } catch (error) {

        console.log("LOGIN ERROR:", error);

        next(error);
    }
};


/* ================= GET USER DATA ================= */

const getUserData = async (req, res, next) => {
    try {

        const user = await User
            .findById(req.user._id)
            .select("-password");

        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {

        console.log("GET USER ERROR:", error);

        next(error);
    }
};


/* ================= LOGOUT USER ================= */

const logout = async (req, res, next) => {
    try {

        res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true
});

        res.status(200).json({
            success: true,
            message: "User logged out successfully!"
        });

    } catch (error) {

        console.log("LOGOUT ERROR:", error);

        next(error);
    }
};


module.exports = {
    register,
    login,
    getUserData,
    logout
};