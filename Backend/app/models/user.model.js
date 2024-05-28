const mongoose = require('mongoose')
const ImageSchema = require("./image.model").imageSchema

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rut: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    speciality: {
        type: String,
        required: false,
    },
    insurance: {
        type: String,
        required: false,
    },
    center: {
        type: String,
        required: false,
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
        },
    ],
    image: ImageSchema
})

module.exports = mongoose.model('User', userSchema)