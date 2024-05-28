const mongoose = require('mongoose')

const reservationSchema = new mongoose.Schema({
    wasAttended: {
        type: Boolean,
        default: false,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    isUnoccupied: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.model('reservation', reservationSchema)