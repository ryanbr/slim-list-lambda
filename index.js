'use strict'

const braveDebugLib = require('./brave/debug')
const braveLambdaLib = require('./brave/lambda')

const dispatch = async lambdaEvent => {
  await braveLambdaLib.cleanEnv()

  try {
    if (lambdaEvent.Records) {
      // Check to see if we're receiving data from SQS
      for (const args of lambdaEvent.Records) {
        const processedLambdaArgs = JSON.parse(args.body)
        await dispatch(processedLambdaArgs)
      }
      return
    }

    let lambdaModule

    switch (lambdaEvent.action) {
      case 'start':
        lambdaModule = require('./brave/lambda_actions/start')
        break

      case 'crawl':
        lambdaModule = require('./brave/lambda_actions/crawl')
        break

      case 'record':
        lambdaModule = require('./brave/lambda_actions/record')
        break

      default:
        console.log('Received unexpected lambda action: ' +
                    lambdaEvent.action)
        return
    }

    const [areValidArgs, msg] = await lambdaModule.validatedArgs()
    if (areValidArgs === false) {
      braveDebugLib.log(`Invalid arguments for action: ${lambdaEvent.action}`)
      braveDebugLib.log(`Received: ${JSON.stringify(lambdaEvent)}`)
      braveDebugLib.log(`Error: ${msg}`)
      throw msg
    }

    braveDebugLib.verbose(`Starting action: ${lambdaEvent.action}`)
    braveDebugLib.verbose(`Args: ${JSON.stringify(lambdaEvent)}`)
    await lambdaModule.start(msg)
  } catch (error) {
    console.log(error)
    throw error
  }
}

module.exports = {
  dispatch
}