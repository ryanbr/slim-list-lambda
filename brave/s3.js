'use strict'

/**
 * @file
 * Common functions for reading and writing data to S3.
 */

const awsSdkLib = require('aws-sdk')

const debugLib = require('./debug')

const globalS3 = new awsSdkLib.S3({
  apiVersion: '2006-03-01',
  region: 'us-east-1'
})

const list = async (bucket, prefix) => {
  debugLib.log(`Listing items in S3: s3://${bucket}/${prefix}/*`)
  const s3Query = {
    Bucket: bucket,
    Prefix: prefix
  }

  const result = await globalS3.listObjectsV2(s3Query).promise()
  debugLib.log(`Received ${result.KeyCount} results in S3 for query.`)

  const matchingKeys = []
  for (const object of result.Contents) {
    matchingKeys.push(object.Key)
  }

  return matchingKeys
}

const read = async (bucket, key) => {
  debugLib.log(`Reading from S3: s3://${bucket}/${key}`)
  const s3Query = {
    Bucket: bucket,
    Key: key
  }

  const result = await globalS3.getObject(s3Query).promise()
  debugLib.log(`Received file of type ${result.ContentType} of size ${result.ContentLength}.`)

  return result.Body
}

const write = async (bucket, key, bufferOrString) => {
  debugLib.log(`Writing to S3: s3://${bucket}/${key}`)
  const s3Query = {
    Bucket: bucket,
    Key: key,
    Body: bufferOrString
  }

  await globalS3.putObject(s3Query).promise()
  debugLib.log(`Wrote file to s3://${bucket}/${key}`)
  return true
}

module.exports = {
  list,
  read,
  write
}