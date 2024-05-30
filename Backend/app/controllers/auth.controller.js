const User = require('../models/user.model')
const Role = require('../models/role.model')
var bcrypt = require("bcryptjs")

// Create a new user (patient)
async function signup(request, reply) {
    try {
        const { name, email, password, rut } = request.body
        if (!name || !email || !password || !rut) {
            reply.status(400).send({ message: "Name, email, password, and rut are required fields." })
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
            rut
        })
        const role = await Role.findOne({ name: "patient" })
        user.roles = [role._id]
        await user.save()
        const message = { message: "User (patient) saved successfully."}
        reply.status(200).send({ ...user._doc, ...message })
    } catch (error) {
        reply.status(500).send(error)
    }
}

async function logout (req, reply) {
	req.logout()
	return {success:true}
}

module.exports = {
	signup,
	logout
}