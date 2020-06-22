class Team {
  constructor (
    id,
    name,
    shortName,
    tla,
    area,
    activeCompetitions,
    squad,
    crestUrl,
    address,
    phone,
    website,
    email,
    yearOfFundation,
    venue) {
    this.id = id
    this.name = name
    this.shortName = shortName
    this.tla = tla
    this.activeCompetitions = activeCompetitions
    this.area = area
    this.squad = squad
    this.crestUrl = crestUrl
    this.address = address
    this.phone = phone
    this.website = website
    this.email = email
    this.fundation = yearOfFundation
    this.venue = venue
  }
}

exports.Team = Team
