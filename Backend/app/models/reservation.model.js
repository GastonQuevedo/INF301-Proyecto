const mongoose = require('mongoose')

const reservationSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    medic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
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