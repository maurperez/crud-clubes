const fs = require('fs')

const validateTla = (tla) => {
  const teamsList = JSON.parse(fs.readFileSync('./data/equipos.json'))

  if (teamsList.every(team => team.tla !== tla)) {
    return true
  } else { return false }
}

const validateName = (name) => {
  const teamsList = JSON.parse(fs.readFileSync('./data/equipos.json'))

  if (teamsList.every(team => team.name !== name)) {
    return true
  } else { return false }
}

exports.validateTla = validateTla
exports.validateName = validateName
