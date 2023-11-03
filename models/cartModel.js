const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        required: false
    },
    discount: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    }
});


module.exports = mongoose.model('Cart', cartSchema);
