const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    conditions: [{ type: String }],
});

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        subscription: {
            plan: {
                type: String,
                enum: ['free', '1_month', '3_months', '6_months'],
                default: 'free',
            },
            expiry: {
                type: Date,
            },
        },
        profiles: [profileSchema],
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
