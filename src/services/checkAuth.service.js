import { createSchoolService } from '../services/school.service'
const lti = require('ltijs').Provider

async function registerPlatformService ({
  url,
  name,
  clientId,
  authenticationEndpoint,
  accesstokenEndpoint,
  authConfig,
  subjects,
  materialTypes,
  languages,
  pedagogicalModels,
  standardIdentifierId,
  startDate,
  endDate
}) {
  try {
    const platform = await lti.registerPlatform({
      url,
      name,
      clientId,
      authenticationEndpoint,
      accesstokenEndpoint,
      authConfig
    })
    const platformId = await platform.platformId()
    await createSchoolService({
      name,
      platformId,
      subjects,
      materialTypes,
      languages,
      pedagogicalModels,
      standardIdentifierId,
      startDate,
      endDate
    })
    return { message: 'Success' }
  } catch (error) {
    const err = new Error()
    err.message = error.message
    err.status = error.status
    throw err
  }
}

export { registerPlatformService }
