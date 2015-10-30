"use strict"

// Get the tools we need.
const os = require("os")
const s3 = require("s3")
const fs = require("fs")

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
    require("util")._extend(this.options.s3Options, credentials)

    // Create the client.
    this._client = s3.createClient(this.options)

    // We're likely to be logged in now.
    this.logged_in = true

    // Return for chaining.
    return this
  }

  /**
   * There's no real log out method on the
   * AWS SDK but we can remove reference to
   * the client and set logged_in to false.
   * @return {Multicolour_S3_Storage} Object for chaining.
   */
  logout() {
    this._client = null
    this.logged_in = false

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
    // Check if we're logged in.
    if (!this.logged_in) {
      this.login(this.options.s3Options)
    }

    // Check we got a destination.
    if (!destination || !destination.hasOwnProperty("bucket") || !destination.hasOwnProperty("name")) {
      throw new ReferenceError("destination must have bucket and name keys.")
    }
    // Upload the file.
    else {
      if (file.hasOwnProperty("pipe")) {
        const file_name = `${os.tempdir()}/${Math.random()}`
        return file.pipe(file_name).on("end", () => {
          return this._client.uploadFile({
            localFile: file_name,
            s3Params: {
              Bucket: destination.bucket,
              Key: destination.name
            }
          })
        })
      }
      else return this._client.uploadFile({
        localFile: file,
        s3Params: {
          Bucket: destination.bucket,
          Key: destination.name
        }
      })
    }
  }

  /**
   * Get the URL to an asset on the server.
   * @param  {multicolour/File} s3_file to get a url for.
   * @return {String}
   */
  get(bucket, key) {
    return s3.getPublicUrl(bucket, key)
  }
}

// Export the required config for Multicolour to register.
module.exports = {
  // It's a server generator, use that type.
  type: require("multicolour/lib/consts").STORAGE_PLUGIN,

  // The generator is the class above.
  generator: Multicolour_S3_Storage
}
