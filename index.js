const express = require('express')
const lti = require('ltijs').Provider
require('dotenv').config()
const path = require('path')
const glob = require('glob')

const setup = async () => {
  const app = express()
  lti.setup(process.env.LTI_KEY, {
    url: process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin'
  })

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

  const dir = path.join(__dirname, '../lti-canvas/src/routes.js')
  console.log(dir)
  const routes = glob.sync(dir)
  routes.forEach(route => {
    require(route).default(app)
  })
}

setup()
