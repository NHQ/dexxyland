var ssbc = require('ssb-client')

module.exports = function(text){
  ssbc(function (err, sbot) {
    sbot.publish({type: 'post', text: text}, function (err, msg) {
      if(err) throw err
      console.log(msg)
    })
  })
}
