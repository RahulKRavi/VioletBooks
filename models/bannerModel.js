const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Banner', bannerSchema);