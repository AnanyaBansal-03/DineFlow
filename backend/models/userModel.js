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
                const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                return passwordRegex.test(v);
            },
            message :
            "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character!"
        }
    },

    role: {
        type: String,
        required: true,
        enum: {
            values: ['Waiter', 'Kitchen', 'Admin'],
            message: '{VALUE} is not a valid role'
        }
    }
}, { timestamps : true });


/* PASSWORD HASHING MIDDLEWARE */
userSchema.pre('save', async function () {

    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});


module.exports = mongoose.model("User", userSchema);