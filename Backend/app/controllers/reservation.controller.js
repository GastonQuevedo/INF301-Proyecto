const Reservation = require('../models/reservation.model')
const User = require('../models/user.model')
const Role = require('../models/role.model')
const mongoose = require('mongoose')

// Get a list of reservations from a medic sorted by their date (createdAt) that belongs to a specific day
async function getReservations(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "secretary" || obj.name === "patient")) {
            const medicId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(medicId)) {
                reply.status(400).send({ message: 'Invalid medic ID format' })
            }
            const medic = await User.findById(medicId)
            if (!medic) {
                reply.status(400).send({ message: "Medic does not exist." })
                return
            }
            const availableDate = request.query.availableDate   // Expecting available date as YYYY-MM-DD
            if (!availableDate || availableDate.length === 0) {
                reply.status(400).send({ message: "Date missing." })
                return
            }
            const isValidDate = (dateString) => !isNaN(Date.parse(dateString))
            if ((availableDate && !isValidDate(availableDate))) {
                reply.status(400).send({ message: "Invalid date format. Please provide a valid date format." })
                return
            }
            const startDateTime = new Date(availableDate)
            const endDateTime = new Date(availableDate)
            startDateTime.setHours(0, 0, 0, 0)
            endDateTime.setHours(23, 59, 59, 999)
            const query = {
                medic: medic,
                createdAt: {
                    $gte: startDateTime,
                    $lt: endDateTime
                }
            }
            const reservations = await Reservation.find(query).sort({createdAt: 1})
            if (reservations.length === 0) {
                reply.status(200).send({ message: "No reservations found." })
                return
            }
            reply.status(200).send(reservations)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Get a list of reservations from all the medics sorted by their date (createdAt) that belongs to today
async function getReservationsToday(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "secretary")) {
            const startDateTime = new Date()
            const endDateTime = new Date()
            startDateTime.setHours(0, 0, 0, 0)
            endDateTime.setHours(23, 59, 59, 999)
            const query = {
                createdAt: {
                    $gte: startDateTime,
                    $lt: endDateTime
                }
            }
            const reservations = await Reservation.find(query).sort({createdAt: 1}).populate('patient').populate('medic')
            if (reservations.length === 0) {
                reply.status(200).send({ message: "No reservations found." })
                return
            }
            reply.status(200).send(reservations)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Get a list of reservations from a medic sorted by their date (createdAt) that belongs to a range of dates
async function getReservationsRange(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "secretary")) {
            const medicId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(medicId)) {
                reply.status(400).send({ message: 'Invalid medic ID format' })
            }
            const medic = await User.findById(medicId)
            if (!medic) {
                reply.status(400).send({ message: "Medic does not exist." })
                return
            }
            const startDate = request.query.startDate   // Expecting available date as YYYY-MM-DD
            const endDate = !request.query.endDate || request.query.endDate.length === 0 ? null : request.query.endDate   // Expecting available date as YYYY-MM-DD
            if (!startDate || startDate.length === 0) {
                reply.status(400).send({ message: "Date missing." })
                return
            }
            const isValidDate = (dateString) => !isNaN(Date.parse(dateString))
            if ((startDate && !isValidDate(startDate)) || (endDate && !isValidDate(endDate))) {
                reply.status(400).send({ message: "Invalid date format. Please provide a valid date format." })
                return
            }
            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                reply.status(400).send({ message: "Invalid date range. Start date must be less than or equal to end date." })
                return
            }
            if (startDate && !endDate) {
                const startDateTime = new Date(startDate)
                const endDateTime = new Date(startDate)
                startDateTime.setHours(0, 0, 0, 0)
                endDateTime.setHours(23, 59, 59, 999)
                const query = {
                    medic: medic,
                    createdAt: {
                        $gte: startDateTime,
                        $lt: endDateTime
                    }
                }
                const reservations = await Reservation.find(query).sort({createdAt: 1}).populate('patient').populate('medic')
                if (reservations.length === 0) {
                    reply.status(200).send({ message: "No reservations found." })
                    return
                }
                reply.status(200).send(reservations)
            } else {
                const startDateTime = new Date(startDate)
                const endDateTime = new Date(endDate)
                startDateTime.setHours(0, 0, 0, 0)
                endDateTime.setHours(23, 59, 59, 999)
                const query = {
                    medic: medic,
                    createdAt: {
                        $gte: startDateTime,
                        $lt: endDateTime
                    }
                }
                const reservations = await Reservation.find(query).sort({createdAt: 1}).populate('patient').populate('medic')
                if (reservations.length === 0) {
                    reply.status(200).send({ message: "No reservations found." })
                    return
                }
                reply.status(200).send(reservations)
            }
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Create a new reservation for a medic (agenda)
async function createReservationMedic(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "secretary")) {
            const medicId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(medicId)) {
                reply.status(400).send({ message: 'Invalid medic ID format' })
            }
            const medic = await User.findById(medicId)
            if (!medic) {
                reply.status(400).send({ message: "Medic does not exist." })
                return
            }
            const availableDate = request.query.availableDate   // Expecting available date as YYYY-MM-DD:THH:mm:ss
            if (!availableDate || availableDate.length === 0) {
                reply.status(400).send({ message: "Date missing." })
                return
            }
            const isValidDate = (dateString) => !isNaN(Date.parse(dateString))
            if ((availableDate && !isValidDate(availableDate))) {
                reply.status(400).send({ message: "Invalid date format. Please provide a valid date format." })
                return
            }
            const reservation = new Reservation({
                medic: medic._id,
                createdAt: new Date(availableDate)
            })
            await reservation.save()
            const message = { message: "Reservation added successfully."}
            reply.status(200).send({ ...reservation._doc, ...message })
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Delete an existing hour where a medic is available
async function deleteReservation(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "secretary")) {
            const reservationId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(reservationId)) {
                reply.status(400).send({ message: 'Invalid reservation ID format' })
            }
            const reservation = await Reservation.findByIdAndDelete(reservationId)
            if (!reservation) {
                reply.status(404).send({ message: "Reservation not found." })
                return
            }
            reply.status(200).send({ message: "Reservation deleted successfully." })
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Get a list of medics searched by their speciality
async function searchMedicsSpeciality(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "patient")) {
            const role = await Role.findOne({ name: "medic" })
            const { speciality, insurance, center } = request.query
            if (!speciality || !insurance || !center) {
                reply.status(400).send({ message: "Speciality, insurance, and center are required fields." })
                return
            }
            const query = {
                speciality: speciality,
                insurance: insurance,
                center: center,
                roles: { $in: [
                    role
                ]}
            }
            const users = await User.find(query).sort({name: 1}).select('_id')
            if (users.length === 0) {
                reply.status(200).send({ message: "No medics found." })
                return
            }
            const usersIds = users.map(user => user._id)
            const reservations = await Reservation.aggregate([
                { $match: {
                    medic: { $in: usersIds },
                    isUnoccupied: true
                } },
                { $sort: { createdAt: 1 } },
                {
                    $group: {
                        _id: '$medic',
                        firstReservation: { $first: '$$ROOT' }
                    }
                },
                { $replaceRoot: { newRoot: '$firstReservation' } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'medic',
                        foreignField: '_id',
                        as: 'medicDetails'
                    }
                },
                { $unwind: '$medicDetails' }
            ])
            reply.status(200).send(reservations)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Get a list of medics searched by their name
async function searchMedicsName(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "patient")) {
            const role = await Role.findOne({ name: "medic" })
            const { insurance } = request.query
            if (!insurance) {
                reply.status(400).send({ message: "Insurance is a required field." })
                return
            }
            var nameRegex = {"$regex": new RegExp('^' + request.params.name.toLowerCase(),  'i')}
            const query = {
                insurance: insurance,
                roles: { $in: [
                    role
                ]},
                $or: [
                    { name: nameRegex }
                ]
            }
            const users = await User.find(query).sort({name: 1})
            if (users.length === 0) {
                reply.status(200).send({ message: "No medics found." })
                return
            }
            const usersIds = users.map(user => user._id)
            const reservations = await Reservation.aggregate([
                { $match: {
                    medic: { $in: usersIds },
                    isUnoccupied: true
                } },
                { $sort: { createdAt: 1 } },
                {
                    $group: {
                        _id: '$medic',
                        firstReservation: { $first: '$$ROOT' }
                    }
                },
                { $replaceRoot: { newRoot: '$firstReservation' } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'medic',
                        foreignField: '_id',
                        as: 'medicDetails'
                    }
                },
                { $unwind: '$medicDetails' }
            ])
            reply.status(200).send(reservations)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Get a list of reservations from a patient sorted by their date (createdAt)
async function getReservationsPatient(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "patient")) {
            const patientId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(patientId)) {
                reply.status(400).send({ message: 'Invalid patient ID format' })
            }
            const patient = await User.findById(patientId)
            if (!patient) {
                reply.status(400).send({ message: "Patient does not exist." })
                return
            }
            const query = {
                patient: patient
            }
            const reservations = await Reservation.find(query).sort({createdAt: 1}).populate('medic')
            if (reservations.length === 0) {
                reply.status(200).send({ message: "No reservations found." })
                return
            }
            reply.status(200).send(reservations)
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Change the state of the flag 'isUnoccupied' from a specific reservation (book medical appointment)
async function updateReservationState(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "patient")) {
            const reservationId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(reservationId)) {
                reply.status(400).send({ message: 'Invalid reservation ID format' })
            }
            const reservation = await Reservation.findById(reservationId)
            if (!reservation) {
                reply.status(404).send({ message: "Reservation not found." })
                return
            }
            if (reservation.isUnoccupied) {
                await Reservation.findByIdAndUpdate(reservationId, {patient: currentUser, isUnoccupied: false})
                const reservationToUpdate = await Reservation.findById(reservationId)
                const message = { message: "Reservation updated succesfully. The reservation is now occupied." }
                reply.status(200).send({ ...reservationToUpdate._doc, ...message })
            } else {
                reply.status(400).send({ message: "The reservation is already occupied. Please select another one." })
            }
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

// Change the state of the flag 'isUnoccupied' from a specific reservation (cancel medical appointment)
async function cancelReservationState(request, reply) {
    try {
        currentUser = await User.findById(request.manualUser.id).populate('roles', '-__v')
        if (currentUser.roles.some(obj => obj.name === "patient")) {
            const reservationId = request.params.id
            if (!mongoose.Types.ObjectId.isValid(reservationId)) {
                reply.status(400).send({ message: 'Invalid reservation ID format' })
            }
            const reservation = await Reservation.findById(reservationId)
            if (!reservation) {
                reply.status(404).send({ message: "Reservation not found." })
                return
            }
            if (!reservation.isUnoccupied) {
                await Reservation.findByIdAndUpdate(reservationId, {patient: null, isUnoccupied: true})
                const reservationToUpdate = await Reservation.findById(reservationId)
                const message = { message: "Reservation updated succesfully. The reservation is now unoccupied." }
                reply.status(200).send({ ...reservationToUpdate._doc, ...message })
            } else {
                reply.status(400).send({ message: "The reservation is already unoccupied." })
            }
        } else {
            reply.status(403).send({ message: "You do not have permission to access this resource." })
        }
    } catch (error) {
        reply.status(500).send(error)
    }
}

module.exports = {
    getReservations,
    getReservationsToday,
    getReservationsRange,
    createReservationMedic,
    deleteReservation,
    searchMedicsSpeciality,
    searchMedicsName,
    getReservationsPatient,
    updateReservationState,
    cancelReservationState
}