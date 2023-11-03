const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    address: {
        fname: {
            type: String,
            required: true
        },
        lname: {
            type: String,
            required: true
        },
        house: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        pin: {
            type: Number,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        }
    },
    product: [{
        title: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity:{
            type: Number,
            required:true
        },
        orderStatus: {
            type: String,
            required: true,
            enum: ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled']
        },        
        deliveryTime: {
            type: Date,
            required: false
        }
    }],
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon', 
        required: false
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    orderTotal: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type:String,
        required:true,
        enum: ['COD', 'RazorPay', 'Wallet'],
    },
    paymentStatus: {
        type:String,
        required:true,
        enum: ['Pending', 'Failed', 'Completed']
    },
    paymentId: {
        type:String,
        required:false
    }
});

module.exports = mongoose.model('Order', orderSchema);
