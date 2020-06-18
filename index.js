const fs = require('fs')
const express = require('express')
const multer = require('multer')
const exphbs = require('express-handlebars')
const hbs = exphbs.create({})
const validateForm = require('./src/validate-inputs')
const { check, validationResult } = require('express-validator')
const bodyParser = require('body-parser')

const urlencoded = bodyParser.urlencoded()

const app = express()
const upload = multer({ dest: './uploads/images' })

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(express.static(`${__dirname}/src`))
app.use(express.static(`${__dirname}/uploads`))

const PORT = 8080

app.get('/', (req, res) => {
  res.render('home', {
    layout: 'app'
  })
})

app.get('/newTeam', (req, res) => {
  res.render('new-team', {
    layout: 'app'
  })
})

app.post('/newTeam',
  upload.single('team-image'),
  [check('teamEmail').normalizeEmail().isEmail().withMessage('E-mail is invalid'),
    check('teamFounded').isNumeric().withMessage('Year of fundation is required').isInt({ min: 1000, max: 2020 }).withMessage('Year of fundation is invalid'),
    check('teamTla').not().isEmpty().withMessage('Tla of team is required'),
    check('teamName').not().isEmpty().withMessage('Name of team is required'),
    check('teamPhone').not().isEmpty().withMessage('Phone number is required'),
    check('teamVenue').not().isEmpty().withMessage('Venue is required'),
    check('teamTla').custom(tla => {
      if (!validateForm.validateTla(tla)) {
        throw new Error('This tla is alredy used')
      }
      return true
    }), check('teamName').custom(name => {
      if (!validateForm.validateName(name)) {
        throw new Error('This name is alredy used')
      }
      return true
    })
  ], async (req, res) => {
    if (!req.file) {
      await check('teamImageUrl').not().isEmpty().withMessage('One image is required').run(req)
      await check('teamImageUrl').isURL().withMessage('The image url is invalid').run(req)
    }

    const errors = validationResult(req)

    if (errors.errors.length > 0) {
      res.render('new-team', {
        layout: 'app',
        data: {
          errors: errors.errors
        }
      })
    } else {
      const createTeam = require('./src/team-handlers.js')

      createTeam.createTeam(req.body, req.file)

      res.redirect('/')
    }
  }
)

app.get('/team', (req, res) => {
  res.render('team-list', {
    layout: 'app',
    data: {
      teams: JSON.parse(fs.readFileSync('./data/equipos.json'))
    }
  })
})

app.get('/team/:id', (req, res) => {
  const teamTla = req.param('id')
  const teamInfo = JSON.parse(fs.readFileSync(`./data/equipos/${teamTla}.json`))

  res.render('team', {
    layout: 'app',
    data: {
      teamInfo: teamInfo,
      path: req.path
    }
  })
})

app.get('/team/:id/edit', (req, res) => {
  const teamTla = req.param('id')
  const teamInfo = JSON.parse(fs.readFileSync(`./data/equipos/${teamTla}.json`))

  res.render('team-edit', {
    layout: 'app',
    data: {
      teamInfo: teamInfo
    }
  })
})

app.post('/team/:id/edit', upload.single('team-image'), (req, res) => {
  const teamTla = req.param('id')
  const team = JSON.parse(fs.readFileSync(`./data/equipos/${teamTla}.json`))
  const listTeam = JSON.parse(fs.readFileSync('data/equipos.json'))

  const { teamImageUrl, teamAddress, teamPhone, teamEmail, teamVenue, teamName, teamShortName, teamWebsite } = req.body

  if (req.file) {
    team.crestUrl = '/images/'.concat(req.file.filename)
  } else if (teamImageUrl) {
    team.crestUrl = teamImageUrl
  }

  listTeam.forEach(team => {
    if (team.tla === teamTla) {
      team.name = teamName
      team.shortName = teamShortName
      team.address = teamAddress
      team.phone = teamPhone
      team.email = teamEmail
      team.website = teamWebsite
      team.venue = teamVenue
      team.lastUpdated = JSON.stringify(new Date())

      if (req.file) {
        team.crestUrl = '/images/'.concat(req.file.filename)
      } else if (teamImageUrl) {
        team.crestUrl = teamImageUrl
      }
    }
  })

  team.name = teamName
  team.shortName = teamShortName
  team.website = teamWebsite
  team.address = teamAddress
  team.phone = teamPhone
  team.email = teamEmail
  team.venue = teamVenue
  team.lastUpdated = JSON.stringify(new Date())

  fs.writeFileSync(`data/equipos/${teamTla}.json`, JSON.stringify(team))
  fs.writeFileSync('data/equipos.json', JSON.stringify(listTeam))

  res.redirect('/team/'.concat(teamTla))
})

app.get('/team/:id/delete', (req, res) => {
  res.render('team-delete', {
    layout: 'app'
  })
})

app.post('/team/:id/delete', urlencoded, (req, res) => {
  const teamTLA = req.param('id')
  const teamNamePassed = req.body.teamName

  const TEAM = JSON.parse(fs.readFileSync(`data/equipos/${teamTLA}.json`))
  console.log(TEAM.name, teamTLA, teamNamePassed)

  if (teamNamePassed === TEAM.name) {
    const teamHandler = require('./src/team-handlers.js')

    fs.unlinkSync(`./data/equipos/${teamTLA}.json`)
    teamHandler.deleteTeamFromList(teamTLA)

    res.redirect('/team')
  } else {
    res.render('team-delete', {
      layout: 'app',
      data: {
        error: true
      }
    })
  }
})

app.listen(PORT)
console.log('escuchando en el puerto '.concat(PORT))
