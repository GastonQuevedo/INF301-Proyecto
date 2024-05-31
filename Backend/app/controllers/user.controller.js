const User = require('../models/user.model')
const Role = require('../models/role.model')
var bcrypt = require("bcryptjs")
const mongoose = require('mongoose')

// Get a list of users sorted by their name
async function getUsers(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "admin")) {
            const users = await User.find().sort({name: 1}).populate('roles')
            if (users.length === 0) {
                reply.status(200).send({ message: "No users found." })
                return
            }
            reply.status(200).send(users)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Get a single user by ID
async function getUserById(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "admin")) {
            const userId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                reply.status(400).send({ message: 'Invalid user ID format' })
            }
            const user = await User.findById(userId).populate('roles')
            if (!user) {
                reply.status(404).send({ message: "User not found." })
                return
            }
            reply.status(200).send(user)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Create a new medic
async function createUserMedic(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "admin")) {
            const { name, email, password, rut, speciality, insurance, center} = request.body
            if (!name || !email || !password || !rut || !speciality || !insurance || !center) {
                reply.status(400).send({ message: "Name, email, password, rut, speciality, insurance, and center are required fields." })
                return
            }
            const existingUserEmail = await User.findOne({ email })
            if (existingUserEmail) {
                reply.status(400).send({ message: "Email already exists." })
                return
            }
            const user = new User({
                name,
                email,
                password: bcrypt.hashSync(password, 8),
                rut,
                speciality,
                insurance,
                center
            })
            const role = await Role.findOne({ name: "medic" })
            user.roles = [role]
            await user.save()
            const message = { message: "User (medic) saved successfully."}
            reply.status(200).send({ ...user._doc, ...message })
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}


// Create a new secretary
async function createUserSecretary(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "admin")) {
            const { name, email, password, rut, center} = request.body
            if (!name || !email || !password || !rut || !center) {
                reply.status(400).send({ message: "Name, email, password, rut, and center are required fields." })
                return
            }
            const existingUserEmail = await User.findOne({ email })
            if (existingUserEmail) {
                reply.status(400).send({ message: "Email already exists." })
                return
            }
            const user = new User({
                name,
                email,
                password: bcrypt.hashSync(password, 8),
                rut,
                center
            })
            const role = await Role.findOne({ name: "secretary" })
            user.roles = [role]
            await user.save()
            const message = { message: "User (secretary) saved successfully."}
            reply.status(200).send({ ...user._doc, ...message })
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Update an existing user (medic)
async function updateUserMedic(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "admin")) {
            const updates = request.body
            const userId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                reply.status(400).send({ message: 'Invalid user ID format' })
            }
            const allowedFields = ['name', 'email', 'password', 'rut', 'speciality', 'insurance', 'center']
            const isValidUpdate = Object.keys(updates).every(field => allowedFields.includes(field))
            if (!isValidUpdate) {
                reply.status(400).send({ message: "Invalid fields for update." })
                return
            }
            const user = await User.findByIdAndUpdate(userId, updates)
            if (!user) {
                reply.status(404).send({ message: "User not found." })
                return
            }
            const userToUpdate = await User.findById(userId)
            const message = { message: "User (medic) updated succesfully." }
            reply.status(200).send({ ...userToUpdate._doc, ...message })
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Update an existing user (secretary)
async function updateUserSecretary(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "admin")) {
            const updates = request.body
            const userId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                reply.status(400).send({ message: 'Invalid user ID format' })
            }
            const allowedFields = ['name', 'email', 'password', 'rut', 'center']
            const isValidUpdate = Object.keys(updates).every(field => allowedFields.includes(field))
            if (!isValidUpdate) {
                reply.status(400).send({ message: "Invalid fields for update." })
                return
            }
            const user = await User.findByIdAndUpdate(userId, updates)
            if (!user) {
                reply.status(404).send({ message: "User not found." })
                return
            }
            const userToUpdate = await User.findById(userId)
            const message = { message: "User (secretary) updated succesfully." }
            reply.status(200).send({ ...userToUpdate._doc, ...message })
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Delete an existing user
async function deleteUser(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "admin")) {
            const userId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                reply.status(400).send({ message: 'Invalid user ID format' })
            }
            const user = await User.findByIdAndDelete(userId)
            if (!user) {
                reply.status(404).send({ message: "User not found." })
                return
            }
            reply.status(200).send({ message: "User deleted successfully." })
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Get a list of users that contain the name/email/rut searched
async function searchUsers(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "admin")) {
            var nameRegex = {"$regex": new RegExp('^' + request.params.name.toLowerCase(),  'i')}
            const users = await User.find({$or: [
                { name: nameRegex },
                { email: nameRegex },
                { rut: nameRegex }
            ]}).populate('roles')
            if (users.length === 0) {
                reply.status(200).send({ message: "No users found." })
                return
            }
            reply.status(200).send(users)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Get a list of medics that contain the name
async function searchMedics(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "secretary")) {
            const role = await Role.findOne({ name: "medic" })
            var nameRegex = {"$regex": new RegExp('^' + request.params.name.toLowerCase(),  'i')}
            const query = {
                center: currentUser.center,
                roles: { $in: [
                    role
                ]},
                $or: [
                    { name: nameRegex }
                ]
            }
            const users = await User.find(query).sort({name: 1}).populate('roles')
            if (users.length === 0) {
                reply.status(200).send({ message: "No medics found." })
                return
            }
            reply.status(200).send(users)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

module.exports = {
    getUsers,
    getUserById,
    createUserMedic,
    createUserSecretary,
    updateUserMedic,
    updateUserSecretary,
    deleteUser,
    searchUsers,
    searchMedics
}