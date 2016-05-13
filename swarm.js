var swarmlog = require('swarmlog')
var memdb = require('memdb')

var log = swarmlog({
  keys: require('./keys.json'),
  sodium: require('chloride/browser'),
  db: memdb(),
  valueEncoding: 'json',
  hubs: [ 'http://localhost:11111', 'https://signalhub.mafintosh.com']
})

log.createReadStream({live: true}).on('data', function(data){
  console.log(data)
})

module.exports = log 
