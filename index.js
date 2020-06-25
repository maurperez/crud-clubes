const fs = require('fs')
const express = require('express')
const multer = require('multer')
const exphbs = require('express-handlebars')
const hbs = exphbs.create({})
const validateForm = require('./src/helpers/validate-inputs.js')
const { check, validationResult } = require('express-validator')
const bodyParser = require('body-parser')
const teamHandlers = require('./src/data-handler/team-handlers.js')
require('dotenv').config()

const urlencoded = bodyParser.urlencoded()

const app = express()
const upload = multer({ dest: './uploads/images' })

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(express.static(`${__dirname}/src`))
app.use(express.static(`${__dirname}/uploads`))

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
  [check('email').normalizeEmail().isEmail().withMessage('E-mail is invalid'),
    check('founded').isNumeric().withMessage('Year of fundation is required').isInt({ min: 1000, max: 2020 }).withMessage('Year of fundation is invalid'),
    check('tla').not().isEmpty().withMessage('Tla of team is required'),
    check('name').not().isEmpty().withMessage('Name of team is required'),
    check('phone').not().isEmpty().withMessage('Phone number is required'),
    check('venue').not().isEmpty().withMessage('Venue is required'),
    check('tla').custom(tla => {
      if (!validateForm.validateTla(tla)) {
        throw new Error('This tla is alredy used')
      }
      return true
    }), check('name').custom(name => {
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

    if (!errors.isEmpty()) {
      res.render('new-team', {
        layout: 'app',
        data: {
          errors: errors.errors
        }
      })
    } else {
      teamHandlers.addNewTeam(req.body, req.file)

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
      path: req.path,
      apiKey: process.env.GOOGLE_KEY
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

app.post('/team/:id/edit',
  upload.single('team-image'),
  [check('address').notEmpty().withMessage('Address is required'),
    check('email').isEmail().withMessage('Ivalid E-mail'),
    check('venue').notEmpty().withMessage('A venue is required'),
    check('name').notEmpty().withMessage('The team require a name'),
    check('website').isURL().withMessage('The team website is invalid')
  ], async (req, res) => {
    const teamTla = req.param('id')

    if (req.body.teamImageUrl) {
      await check('teamImageUrl').isURL().run(req)
    }

    const errors = validationResult(req)

    if (errors.isEmpty()) {
      teamHandlers.editTeam(req.body, teamTla, req.file)

      res.redirect(`/team/${teamTla}`)
    } else {
      const teamOriginalInfo = JSON.parse(fs.readFileSync(`./data/equipos/${teamTla}.json`))

      res.render('team-edit', {
        layout: 'app',
        data: {
          teamInfo: teamOriginalInfo,
          errors: errors.errors
        }
      })
    }
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

  if (teamNamePassed === TEAM.name) {
    teamHandlers.deleteTeam(teamTLA)
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

app.listen(process.env.PORT || 8080)
console.log('escuchando en el puerto '.concat(PORT))
