const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true
    },

    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message : "Email must be in valid format!"
        }
    },

    phone: {
        type : Number,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message : "Phone number must be a 10-digit number!"
        }
    },

    password: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // Password must have:
                // - At least 8 characters
                // - At least one uppercase letter
                // - At least one lowercase letter
                // - At least one number
                // - At least one special character
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                return passwordRegex.test(v);
            },
            message : "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character!"
        }
    },

    role: {
        type: String,
        required: true,
        enum: {
            values: ['Waiter', 'Cashier', 'Admin'],
            message: '{VALUE} is not a valid role'
        }
    }
}, { timestamps : true });

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("User", userSchema);