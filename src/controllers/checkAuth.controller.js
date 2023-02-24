// import { checkAuthService } from '../services/checkAuth.service'

async function checkAuth (req, res, next) {
  try {
    console.log('CheckAuth Req', req)
    console.log('CheckAuth Res', res)
    res.status(200).send('Success')
  } catch (error) {
    next(error)
  }
}

export { checkAuth }
