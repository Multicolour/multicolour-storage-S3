"use strict"

// Get the testing library.
const tape = require("tape")

// Get Multicolour.
const Multicolour = require("multicolour")
const storage = require("../index")

// Where we keep the test content.
const test_content_path = "./tests/test_content/"

process.env.AWS_ACCESS_KEY_ID = "123"
process.env.AWS_SECRET_ACCESS_KEY = "123"

tape("Waterline S3 storage adapter init.", test => {
  // Create an instance of multicolour.
  const multicolour = Multicolour
    .new_from_config_file_path(`${test_content_path}config.js`)
    .scan()

  const bucket_conf = {
    bucket: "context-captures",
    name: "circle.svg"
  }

  const test_file = `${test_content_path}/circle.svg`

  test.doesNotThrow(() => multicolour.use(storage), "Registering S3 storage adapter does not throw error.")
  const storage_instance = multicolour.request("storage")

  test.notEqual(typeof storage_instance, "undefined", "Storage is set after registering storage plugin.")
  test.throws(() => storage_instance.upload(test_file), ReferenceError, "Upload without destination throws.")
  test.throws(() => storage_instance.upload(test_file, {bucket: ""}), ReferenceError, "Upload without destination.name throws.")
  test.ok(storage_instance.get("context-captures", "circle.svg"), "Gets the url to something in a bucket.")

  test.doesNotThrow(() => storage_instance.logout(), "Does not error when logging out.")

  // Reset Multicolour
  multicolour.reset()

  test.end()
})
