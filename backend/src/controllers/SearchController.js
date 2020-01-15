const Dev = require('../models/Dev')
const { getArray } = require('./utils/Formatter')

module.exports = {
    async index (req, res) {
        // Buscar devs em um raio de 10km
        // Filter by Tech

        const { longitude, latitude, techs } = req.query

        const techsArray = getArray(techs)

        const devs = await Dev.find({
            techs: {
                $in: techsArray
            },
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 10000
                }
            }
        })

        return res.json({ devs })

    }
}