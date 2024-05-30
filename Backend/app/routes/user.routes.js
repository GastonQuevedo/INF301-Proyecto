const userController = require('../controllers/user.controller')
const authenticate = require('../middleware/authenticate')

async function userRoutes(fastify, options, done) {
    fastify.addHook("onRequest", authenticate)

    fastify.get('/', userController.getUsers)
    fastify.get('/:id', userController.getUserById)
    fastify.post('/medic', userController.createUserMedic)
    fastify.post('/secretary', userController.createUserSecretary)
    fastify.put('/medic/:id', userController.updateUserMedic)
    fastify.put('/secretary/:id', userController.updateUserSecretary)
    fastify.delete('/:id', userController.deleteUser)
    fastify.get('/searchUsers/:name', userController.searchUsers)
    fastify.get('/searchMedics/:name', userController.searchMedics)

    done()
}

module.exports = userRoutes