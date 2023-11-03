const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    expirationDate: {
        type:Date,
        requied: true
    },
    minimumOrderAmount: {
        type: Number,
        default: true
    },
    isActive: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('Coupon', couponSchema);
