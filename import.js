var series = require('run-series')
var blobToBuffer = require('blob-to-buffer')
var xhr = require('xhr')

module.exports = function (files, cb) {
  var tasks = Array.prototype.map.call(files, function (file) {
    return function (cb) {
      blobToBuffer(file, function (err, buffer) {
        if (err) return cb(err)
        buffer.name = file.name
        buffer.size = file.size
        buffer.type = file.type
        buffer.lastModifiedDate = file.lastModifiedDate
        cb(null, buffer)
      })
    }
  })
  series(tasks, function (err, results) {
    cb(err, results)
  })
}
