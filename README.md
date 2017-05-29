# multicolour-storage-S3

[![Greenkeeper badge](https://badges.greenkeeper.io/Multicolour/multicolour-storage-S3.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/newworldcode/multicolour-storage-S3.svg)](https://travis-ci.org/newworldcode/multicolour-storage-S3)
[![Coverage Status](https://coveralls.io/repos/newworldcode/multicolour-storage-S3/badge.svg?branch=master&service=github)](https://coveralls.io/github/newworldcode/multicolour-storage-S3?branch=master)
[![bitHound Score](https://www.bithound.io/github/newworldcode/multicolour-storage-S3/badges/score.svg)](https://www.bithound.io/github/newworldcode/multicolour-storage-S3)

S3 Storage provider plugin for Multicolour, upload files to and retrieve files from
Amazon's S3 service.

You can login manually; like below, we don't recommend hardcoding values in scripts and highly recommend setting `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your environment instead.

```
// Configure our service.
const my_service = require("multicolour")
  // Configure the service core and scan for content. 
  .new_from_config_file_path("./config.js")
  .scan()

// Register the server plugin.
my_service.start.use(require("multicolour-storage-s3"))
  .request("storage")
    .login({
      accessKeyId: "",
      secretAccessKey: ""
    })

// Start the service.
my_service.start()
```

[MIT License](./LICENSE)
