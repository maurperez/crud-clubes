const fs = require('fs')

const createTeamObject = (teamData, imageFile) => {
  const {
    teamImageUrl,
    teamCountry,
    teamName,
    teamShortName,
    teamTla,
    teamAddress,
    teamPhone,
    teamEmail,
    teamWebsite,
    teamVenue,
    teamFounded
  } = teamData

  const teamObject = {
    id: Math.floor(Math.random() * (1 - 101) + 101),
    area: {
      id: 1,
      name: teamCountry
    },
    name: teamName,
    shortName: teamShortName,
    tla: teamTla.toUpperCase(),
    crestUrl: imageFile ? '/images/'.concat(imageFile.filename) : teamImageUrl,
    address: teamAddress,
    phone: teamPhone,
    website: teamWebsite,
    email: teamEmail,
    founded: teamFounded,
    clubColors: '',
    venue: teamVenue,
    lastUpdated: JSON.stringify(new Date())
  }

  const teamsList = JSON.parse(fs.readFileSync('data/equipos.json'))
  teamsList.push(teamObject)

  const teamObjectComplete = { ...teamObject }
  teamObjectComplete.activeCompetitions = []
  teamObjectComplete.squad = []

  fs.writeFileSync('data/equipos.json', JSON.stringify(teamsList))
  fs.writeFileSync(`data/equipos/${teamObject.tla}.json`, JSON.stringify(teamObjectComplete))
}

const deleteTeamList = (teamTLA) => {
  const teamsList = JSON.parse(fs.readFileSync('data/equipos.json'))

  const newTeamsList = teamsList.filter(team => team.tla !== teamTLA)

  fs.writeFileSync('data/equipos.json', JSON.stringify(newTeamsList))
}

exports.createTeam = createTeamObject
exports.deleteTeamFromList = deleteTeamList
