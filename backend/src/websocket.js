const socketIO = require('socket.io')
const { getArray } = require('./controllers/utils/Formatter')
const calculateDistance = require('./controllers/utils/CalculateDistance')

let io
const connections = []

exports.setupWebSocket = (server) => {
    io = socketIO(server)

    io.on('connection', socket => {

        const { latitude, longitude, techs } = socket.handshake.query

        connections.push({
            id: socket.id,
            coordinates: {
                latitude: Number(latitude),
                longitude: Number(longitude)
            },
            techs: getArray(techs)
        })
    })
}

exports.findConnections = (coordinates, techs) => {
    return connections.filter(connection => {
        return calculateDistance(coordinates, connection.coordinates) < 10
            && connection.techs.some(item => techs.includes(item))
    })
}

exports.sendMessage = (to, message, data) => {
    to.forEach(connection => {
        io.to(connection.id).emmit(message, data)
    });
}