require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')

const lti = require('ltijs').Provider
const glob = require('glob')
const express = require('express')

// Setup
lti.setup(
  process.env.LTI_KEY,
  {
    url: process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin' // connection to mongodb
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
  return lti.redirect(res, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setting up normal routes
const app = express()
const dir = path.join(__dirname, '../src/normalRoutes/*.route.js')
const normalRoutes = glob.sync(dir)
normalRoutes.forEach(route => {
  require(route).default(app)
})

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT })

  /**
   * Register platform
   */
  await lti.registerPlatform({
    url: 'https://canvas.instructure.com', // or url : 'https://canvas.exampledomain.com' (depends on config form Canvas instance) if iss is changed in config/security.yml file! It must be the same as the iss
    name: 'Canvas', // domain name from canvas instance
    clientId: '10000000000002', // clientid from the lti plugin which you get inside canvas after installing the plugin
    authenticationEndpoint:
      'https://canvas-lms.pagewerkz.com/api/lti/authorize_redirect',
    accesstokenEndpoint: 'https://canvas-lms.pagewerkz.com/login/oauth2/token',
    authConfig: {
      method: 'JWK_SET',
      key: 'https://canvas-lms.pagewerkz.com/api/lti/security/jwks'
    }
  })

  // For other plattforms, for example moodle:

  // Moodle EXAMPLE
  // await lti.registerPlatform({
  //   url: 'https://sandbox.moodledemo.net',
  //   name: 'Moodle',
  //   clientId: 'x0GIpAfkLHGrXyW',
  //   authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
  //   accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
  //   authConfig: {
  //     method: 'JWK_SET',
  //     key: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
  //   }
  // })
}

setup()
