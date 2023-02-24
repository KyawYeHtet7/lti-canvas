import express from 'express'

import { checkAuth } from '../controllers/checkAuth.controller'

const router = express.Router()

router.get('/', checkAuth)

export default app => {
  app.use('/checkAuth', router)
}
