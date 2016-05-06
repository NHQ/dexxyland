var swarmlog = require('swarmlog')
var memdb = require('memdb')

var log = swarmlog({
  keys: require('./keys2.json'),
  sodium: require('chloride/browser'),
  db: memdb(),
  valueEncoding: 'json',
  hubs: [ 'http://10.0.0.2:11111']
})

log.createReadStream({live: true}).on('data', function(data){
  console.log(data)
})

module.exports = log 
