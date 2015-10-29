"use strict"

// Get the tools we need.
const s3 = require("s3")

class Multicolour_S3_Storage {

  /**
   * Create default options and values.
   * @return {Multicolour_S3_Storage} Object for chaining.
   */
  constructor() {
    this.logged_in = false

    // Set up the default options.
    this.options = {
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    }

    return this
  }

  /**
   * Create a client to connect to S3 using details
   * and prepare for media upload and retrieval.
   * @param  {Object} config object containing accessKeyId, secretAccessKey keys
   * @return {Multicolour_S3_Storage} Object for chaining.
   */
  login(credentials) {
    // Update the credentials.
    this.options.s3Options = credentials

    // Create the client.
    this._client = s3.createClient(this.options)

    // We're likely to be logged in now.
    this.logged_in = true

    // Return for chaining.
    return this
  }

  /**
   * Upload a file to an S3 bucket and return
   * an EventEmitter to listen for data events.
   * @param  {multicolour/File} file to upload to S3.
   * @param  {Object} destination object with bucket and name keys.
   * @return {EventEmitter} object to listen for event
   */
  upload(file, destination) {
    // Check we got a destination.
    if (!destination.hasOwnProperty("bucket") || !destination.hasOwnProperty("name")) {
      throw new ReferenceError("destination must have bucket and name keys.")
    }
    // Upload the file.
    else {
      return this._client.uploadFile({
        localFile: file.path,
        s3Params: {
          Bucket: destination.bucket,
          Key: destination.name
        }
      })
    }
  }

  /**
   * Download a file from an S3 bucket and return
   * an EventEmitter to listen for data events.
   * @param  {multicolour/File} file to upload to S3.
   * @param  {Object} destination object with bucket and name keys.
   * @return {EventEmitter} object to listen for event
   */
  get(s3_file, destination) {
    return this._client.downloadFile({
      localFile: destination,

      s3Params: {
        Bucket: s3_file.bucket,
        Key: s3_file.name
      }
    })
  }
}

// Export the required config for Multicolour to register.
module.exports = {
  // It's a server generator, use that type.
  type: require("multicolour/lib/consts").STORAGE_PLUGIN,

  // The generator is the class above.
  generator: Multicolour_S3_Storage
}
