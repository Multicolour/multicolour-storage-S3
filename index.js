"use strict"

// Get the tools we need.
const os = require("os")
const s3 = require("s3")
const Plugin = require("multicolour/lib/plugin")

class Multicolour_S3_Storage extends Plugin {

  /**
   * Create default options and values.
   * @return {Multicolour_S3_Storage} Object for chaining.
   */
  constructor() {
    super()

    this.logged_in = false

    // Set up the default options.
    this.options = {
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    }

    // Can be overwritten per request,
    // is default when no bucket is
    // specified in all operations.
    this.target_bucket = ""

    return this
  }

  /**
   * Set the storage name on our host.
   * @param  {Multicolour} multicolour host instance.
   * @return {void}
   */
  register(multicolour) {
    multicolour.reply("storage", this)
  }

  /**
   * Create a client to connect to S3 using details
   * and prepare for media upload and retrieval.
   * @param  {Object} config object containing accessKeyId, secretAccessKey keys
   * @return {Multicolour_S3_Storage} Object for chaining.
   */
  login(credentials) {
    // Check for a default bucket.
    if (credentials.bucket) {
      // Set the target bucket.
      this.target_bucket = credentials.bucket

      // Remove it.
      delete credentials.bucket
    }

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
   * @param  {String} file to upload to S3.
   * @param  {Object} destination object with bucket and name keys.
   * @return {EventEmitter} object to listen for event
   */
  upload(file, destination) {
    // Check if we're logged in.
    if (!this.logged_in) {
      this.login(this.options.s3Options)
    }

    // Check we have a destination.
    if (
      (!destination && !this.target_bucket) ||
      (!destination.hasOwnProperty("bucket") && !this.target_bucket) ||
      !destination.hasOwnProperty("name")
    ) {
      throw new ReferenceError("destination must have bucket and name keys.")
    }
    // Upload the file.
    else {
      if (file.pipe) {
        // Write it to the temp dir.
        const file_name = `${os.tmpdir()}/${Math.random()}`

        // Do the write then upload.
        return file.pipe(file_name).on("end", () => {
          return this._client.uploadFile({
            localFile: file_name,
            s3Params: {
              Bucket: destination.bucket || this.target_bucket,
              Key: destination.name
            }
          })
        })
      }
      else {
        return this._client.uploadFile({
          localFile: file,
          s3Params: {
            Bucket: destination.bucket || this.target_bucket,
            Key: destination.name
          }
        })
      }
    }
  }

  /**
   * Remove a file on an S3 bucket and return
   * an EventEmitter to listen for data events.
   * @param  {String} file to destroy on S3.
   * @return {EventEmitter} object to listen for event
   */
  destroy(in_bucket, target_name) {
    // Default to all arguments present.
    let bucket = in_bucket
    let name = target_name

    // If no `target_name`, swap them
    // over and default the bucket.
    if (!target_name) {
      bucket = this.target_bucket
      name = in_bucket
    }

    // Delete the object.
    return this._client.deleteObjects({
      s3Params: {
        Bucket: bucket,
        Key: name
      }
    })
  }

  /**
   * Get the URL to an asset on the server.
   * @param  {String} s3_file to get a url for.
   * @return {String}
   */
  get(in_bucket, target_name) {
    // Default to all arguments present.
    let bucket = in_bucket
    let key = target_name

    // If no `target_name`, swap them
    // over and default the bucket.
    if (!target_name) {
      bucket = this.target_bucket
      key = in_bucket
    }

    return s3.getPublicUrl(bucket, key)
  }
}

// Export Multicolour_S3_Storage for Multicolour to register.
module.exports = Multicolour_S3_Storage
