const team = require('../entities/team.js')

const teamMapper = (teamData, imageFile, competitions, squad) => {
  const ID = 1

  const {
    name,
    tla,
    shortName,
    email,
    address,
    venue,
    founded,
    website,
    phone
  } = teamData

  const crestUrl = imageFile ? imageFile.filename : teamData.teamImageUrl
  const area = {
    id: 1,
    name: teamData.country
  }
  const activeCompetitions = competitions !== undefined ? competitions : []
  const activeSquad = squad !== undefined ? squad : []

  return new team.Team(ID, name, shortName, tla, area, activeCompetitions, activeSquad, crestUrl, address, phone, website, email, founded, venue)
}

exports.map = teamMapper
