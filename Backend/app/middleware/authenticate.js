const authenticate = async (request, reply) => {
    try {
        const authorizationHeader = request.headers.authorization
        if (!authorizationHeader) {
            reply.status(401).send({ message: "Authorization header is missing."})
            return
        }
        await request.jwtVerify()
    } catch (error) {
        reply.status(401).send({ message: 'Unauthorized! Access denied due to invalid credentials.' })
    }
}

module.exports = authenticate