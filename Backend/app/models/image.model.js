const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        required: true
    }
})

const image = mongoose.model('Image', imageSchema)
module.exports = { image, imageSchema }