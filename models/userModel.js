const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin:
    {
        type: Number,
        required: true
    },
    is_blocked:
    {
        type: Number,
        default: 0
    },
    is_verified: {
        type: Number,
        default: 0
    },
    wallet: {
        type: Number,
        default: 0
    }
})

const addressSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
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
    },
    isDeleted: {
        type: Number,
        default: 0
    }
})

const User = mongoose.model('User', userSchema)
const Address = mongoose.model('Address', addressSchema)

module.exports = {
    User,
    Address
}