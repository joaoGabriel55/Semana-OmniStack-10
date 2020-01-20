const axios = require('axios')
const Dev = require('../models/Dev')
const { getArray } = require('./utils/Formatter')
const { findConnections, sendMessage } = require('../websocket')


// index, show, store, update, destroy

module.exports = {
    async index (req, res) {
        const devs = await Dev.find()
        return res.json(devs)
    },
    async store (req, res) {
        const { github_username, techs, latitude, longitude } = req.body

        let dev = await Dev.findOne({ github_username })

        if (!dev) {
            const response = await axios.get(`https://api.github.com/users/${github_username}`)

            const { name = login, avatar_url, bio } = response.data

            const techsArray = getArray(techs)

            const location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            }

            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location
            })

            // Filter connections which are 10km of distance
            // PT-BR: E que o novo dev tenha pelo menos uma das techs filtradas
            const sendSocketMessageTo = findConnections({ latitude, longitude }, techsArray)
            console.log(sendSocketMessageTo)

            sendMessage(sendSocketMessageTo, 'new-dev', dev)
        }
        return res.json(dev)
    },
    async update (req, res) {
        let payload = req.body
        if (payload.hasOwnProperty("github_username"))
            delete payload['github_username']

        const id = req.body.id
        console.log(id)

        await Dev.findByIdAndUpdate(id, req.body, (err, dev) => {
            if (err) return res.json(err)
            if (dev)
                return res.json({ dev })
        })
    },
    async destroy (req, res) {
        const id = req.params.id

        await Dev.findByIdAndDelete(id, (err, dev) => {
            if (err) return res.json(err)
            if (dev)
                return res.json({ message: `Dev '${dev.id}' was removed.` })
            else
                return res.json({ message: `Dev '${id}' not found.` })
        })
    }
}