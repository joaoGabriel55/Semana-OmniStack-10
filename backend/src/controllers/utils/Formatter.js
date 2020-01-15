// DRY - Don't Repeat Yourself
const getArray = (techs) => techs.split(',').map(tech => tech.trim())

module.exports = { getArray }