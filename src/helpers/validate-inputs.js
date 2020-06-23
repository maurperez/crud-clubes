const fs = require('fs')

const validateTla = (tla) => {
  const teamsList = JSON.parse(fs.readFileSync('./data/equipos.json'))

  return teamsList.every(team => team.tla !== tla)
}

const validateName = (name) => {
  const teamsList = JSON.parse(fs.readFileSync('./data/equipos.json'))

  return teamsList.every(team => team.name !== name)
}

exports.validateTla = validateTla
exports.validateName = validateName
