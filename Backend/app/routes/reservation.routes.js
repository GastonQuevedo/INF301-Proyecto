const reservationController = require('../controllers/reservation.controller')
const authenticate = require('../middleware/authenticate')

async function reservationRoutes(fastify, options) {
    fastify.addHook("onRequest", authenticate)

    fastify.get('/:id', reservationController.getReservations)
    fastify.get('/', reservationController.getReservationsToday)
    fastify.get('/range/:id', reservationController.getReservationsRange)
    fastify.post('/:id', reservationController.createReservationMedic)
    fastify.delete('/:id', reservationController.deleteReservation)
    fastify.get('/medicspeciality', reservationController.searchMedicsSpeciality)
    fastify.get('/medicname', reservationController.searchMedicsName)
    fastify.get('/patient/:id', reservationController.getReservationsPatient)
    fastify.put('/:id', reservationController.updateReservationState)
    fastify.put('/paid/:id', reservationController.updatePaidState)
    fastify.put('/cancel/:id', reservationController.cancelReservationState)
    fastify.get('/medic', reservationController.getReservationsMedic)
    fastify.put('/attend/:id', reservationController.updateReservationToAttended)

}

module.exports = reservationRoutes