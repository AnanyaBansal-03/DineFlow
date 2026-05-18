// backend/middlewares/tokenVerification.js
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/userModel");

const isVerifiedUser = async (req, res, next) => {
    try {
        // Try to get token from cookie first
        let token = req.cookies?.accessToken;
        
        // If not in cookie, try Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        if (!token) {
            const error = createHttpError(401, "Authentication required!");
            return next(error);
        }

        const decodeToken = jwt.verify(token, config.accessTokenSecret);

        const user = await User.findById(decodeToken._id);
        if (!user) {
            const error = createHttpError(401, "User not found!");
            return next(error);
        }

        req.user = user;
        next();

    } catch (error) {
        const err = createHttpError(401, "Invalid or expired token!");
        next(err);
    }
};

module.exports = { isVerifiedUser };