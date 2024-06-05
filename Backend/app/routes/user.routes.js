const userController = require('../controllers/user.controller')
const authenticate = require('../middleware/authenticate')
const fs = require('fs')
const path = require('path')
const fastifyMulter = require('fastify-multer')
const storage = fastifyMulter.diskStorage({
    destination: function (req, file, cb) {
        const filePath = `uploads/medics`
        fs.mkdirSync(filePath, { recursive: true })
        cb(null, filePath)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = fastifyMulter({ storage: storage })

async function userRoutes(fastify, options) {
    fastify.addHook("onRequest", authenticate)

    fastify.get('/', userController.getUsers)
    fastify.get('/:id', userController.getUserById)
    fastify.post('/medic', { preHandler: upload.single('picture') }, userController.createUserMedic)
    fastify.post('/secretary', userController.createUserSecretary)
    fastify.put('/medic/:id', userController.updateUserMedic)
    fastify.put('/secretary/:id', userController.updateUserSecretary)
    fastify.delete('/:id', userController.deleteUser)
    fastify.get('/searchUsers/:name', userController.searchUsers)
    fastify.get('/searchMedics/:name', userController.searchMedics)

}

module.exports = userRoutes