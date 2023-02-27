const express = require('express')
const lti = require('ltijs').Provider
require('dotenv').config()
const path = require('path')
const glob = require('glob')

const setup = async () => {
  const app = express()
  lti.setup(
    process.env.LTI_KEY,
    {
      url: process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin'
    },
    {
      staticPath: path.join(__dirname, './public'), // Path to static files
      cookies: {
        secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
        sameSite: 'None' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
      },
      devMode: false // Set DevMode to true if the testing platform is in a different domain and https is not being used
    }
  )

  // When receiving successful LTI launch redirects to app
  lti.onConnect(async (token, req, res) => {
    return res.sendFile(path.join(__dirname, './public/index.html'))
  })

  // When receiving deep linking request redirects to deep screen
  lti.onDeepLinking(async (token, req, res) => {
    console.log('Token', token)
    console.log('Req', req)
    console.log('Res', res)
    return lti.redirect(res, '/deeplink', { newResource: true })
  })

  // Start LTI provider in serverless mode
  lti.deploy({ serverless: true })

  // Mount Ltijs express app into preexisting express app with /lti prefix
  app.use('/lti', lti.app)

  const dir = path.join(__dirname, 'src/*.js')
  const routes = glob.sync(dir.replace(/\\/g, '/'))
  routes.forEach(route => {
    console.log(route)
    require(route)(app)
  })

  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
  })
}

setup()
