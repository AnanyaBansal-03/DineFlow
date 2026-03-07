const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const register = async (req, res, next) => {
    try {
        const { name, phone, email, password, role } = req.body;

        // Check required fields
        if(!name || !phone || !email || !password || !role){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        // Check if user already exists
        const isUserPresent = await User.findOne({email});
        if(isUserPresent){
            const error = createHttpError(400, "User already exists with this email!");
            return next(error);
        }

        // Create new user (validation will happen in the schema)
        const user = { name, phone, email, password, role };
        const newUser = new User(user);
        await newUser.save();

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true, 
            message: "New user created successfully!", 
            data: userResponse
        });

    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            const errorMessage = messages.join(', ');
            return next(createHttpError(400, errorMessage));
        }
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "Email and password are required!");
            return next(error);
        }

        const user = await User.findOne({email});
        if(!user){
            const error = createHttpError(401, "Invalid email or password");
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid email or password");
            return next(error);
        }

        const accessToken = jwt.sign({_id: user._id}, config.accessTokenSecret, {
            expiresIn: '1d'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true, 
            message: "User logged in successfully!", 
            data: userResponse
        });

    } catch (error) {
        next(error);
    }
}

const getUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            const error = createHttpError(404, "User not found");
            return next(error);
        }
        res.status(200).json({success: true, data: user});
    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });
        res.status(200).json({success: true, message: "User logged out successfully!"});
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login, getUserData, logout };