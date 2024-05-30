const authController = require("../controllers/auth.controller")
const User = require("../models/user.model")
const RefreshToken = require("../models/refreshToken.model")
var bcrypt = require("bcryptjs")

async function authRoutes(fastify, options, done) {
    fastify.post("/signin", async (request, reply) => {
        try {
            const userEmail = request.body.email
            const user = await User.findOne({ email: userEmail }).populate("roles", "-__v")
            if (!user) {
                return reply.status(404).send({ message: 'User Not found' })
            }
            let passwordIsValid = bcrypt.compareSync(
                request.body.password,
                user.password
            )
            if (!passwordIsValid) {
                return reply.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                })
            }
            const token = fastify.jwt.sign({ id: user.id })
            let refreshToken = await RefreshToken.createToken(user)
            let authorities = []
            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
            }
            reply.status(200).send({
                id: user._id,
                name: user.name,
                email: user.email,
                roles: authorities,
                accessToken: token,
                refreshToken: refreshToken,
            })
        } catch (error) {
            reply.status(500).send(error)
        }
    })
    fastify.post("/refreshtoken", async (req, reply) => {
        const { refreshToken: requestToken } = req.body
        if (requestToken == null) {
            return reply.status(403).send({ message: "Refresh Token is required!" });
        }
        try {
            let refreshToken = await RefreshToken.findOne({ token: requestToken })
            if (!refreshToken) {
                reply.status(403).send({ message: "Refresh token is not in database!" })
                return
            }
            if (RefreshToken.verifyExpiration(refreshToken)) {
                RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec()
                reply.status(403).send({
                    message: "Refresh token was expired. Please make a new signin request",
                })
                return
            }
            let newAccessToken = fastify.jwt.sign({ id: refreshToken.user._id }, {
                expiresIn: process.env.JWT_EXPIRATION,
            })
            return reply.status(200).send({
                accessToken: newAccessToken,
                refreshToken: refreshToken.token,
            })
        } catch (err) {
            console.log("error refresh:",err)
            return reply.status(500).send({ message: err })
        }
    })
    fastify.post('/signup', authController.signup)
}

module.exports = authRoutes