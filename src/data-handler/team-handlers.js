const fs = require('fs')
const teamMapper = require('./mappers/teamMap.js')

const addNewTeam = (teamData, imageFile) => {
  const team = teamMapper.map(teamData, imageFile)

  const teamForList = {
    id: team.id,
    area: team.area,
    name: team.name,
    shortName: team.shortName,
    tla: team.tla,
    crestUrl: team.crestUrl,
    address: team.address,
    phone: team.phone,
    website: team.website,
    email: team.email,
    founded: team.fundation,
    venue: team.venue
  }

  const completeTeam = { ...teamForList }
  completeTeam.activeCompetitions = team.activeCompetitions
  completeTeam.squad = team.squad

  const teamsList = JSON.parse(fs.readFileSync('data/equipos.json'))
  teamsList.push(teamForList)

  fs.writeFileSync('data/equipos.json', JSON.stringify(teamsList))
  fs.writeFileSync(`data/equipos/${team.tla}.json`, JSON.stringify(completeTeam))
}

const deleteTeam = (teamTLA) => {
  const teamsList = JSON.parse(fs.readFileSync('data/equipos.json'))

  const newTeamsList = teamsList.filter(team => team.tla !== teamTLA)

  fs.writeFileSync('data/equipos.json', JSON.stringify(newTeamsList))
  fs.unlinkSync(`./data/equipos/${teamTLA}.json`)
}

const editTeam = (newData, teamTLA, imageFile) => {
  const teamsList = JSON.parse(fs.readFileSync('data/equipos.json'))
  const teamCompleteInfo = JSON.parse(fs.readFileSync(`data/equipos/${teamTLA}.json`))

  const image = imageFile ? `/images/${imageFile.filename}` : newData.crestUrl ? newData.crestUrl : teamCompleteInfo.crestUrl

  const newTeamCompleteInfo = Object.assign({ ...teamCompleteInfo }, newData)
  newTeamCompleteInfo.crestUrl = image

  const newTeamsList = [...teamsList]

  newTeamsList.forEach(team => {
    if (team.tla === teamTLA) {
      Object.assign(team, newData)
      team.crestUrl = image
    }
  })

  fs.writeFileSync('data/equipos.json', JSON.stringify(newTeamsList))
  fs.writeFileSync(`data/equipos/${teamTLA}.json`, JSON.stringify(newTeamCompleteInfo))
}

exports.addNewTeam = addNewTeam
exports.deleteTeam = deleteTeam
exports.editTeam = editTeam
