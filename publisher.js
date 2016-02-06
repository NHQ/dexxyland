var http = require('http')
var path = require('path')

var fs = require('fs')
var ssbc = require('ssb-client')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')
var crypto = require('crypto')
var ecstatic = require('ecstatic')
var answer = require('answerver')
var ip = require('non-private-ip')
var router = require('router')()
var qs = require('querystring')

var server = http.createServer(handler)
var serve = ecstatic('./public')
answer(server, 11001)

server.on('listening', function(){
  console.log('address is: http://' + ip.private() + ':' + server.address().port)
})

function handler (req, res){

  var p = req.url.split('/')
  p.shift()
  
  if(p[0] === 'api'){
    var q = qs.parse(p[1])
    
  }

  else serve(req, res)

  function hashBlob(req, res, q){
    ssbc(function(err, sbot){
      if(err) console.log(err)
      var hasher = createHash()
      pull(
        toPull.source(req),
        hasher,
        sbot.blobs.add(function(err){
          if(err) console.log(err)
          res.writeHead(200, {'content-type': 'application/json'})
          var data = {}
          data.hash = hasher.digest
          data.name = q.name
          data.type = q.type
          res.end(JSON.stringify(data))
        })
      )
    })
  }

  
  function sblob(req, res, q){
    ssbc(function(err, sbot){
      if(err) console.log(err)
      var hasher = createHash()
      pull(
        toPull.source(req),
        hasher,
        sbot.blobs.add(function(err){
          if(err) console.log(err)
          if(q.type.match('image/*')){
            q.text += '\n\n!['+q.title+']('+hasher.digest+')' 
          } 
          sbot.publish({type: 'post', text: q.text, mentions: {
            link: hasher.digest,
            name: q.name
          }}, function(err){
            if(err) console.log(err)
            res.writeHead(err ? 400 : 200)
            res.end()
          })
        })
      )
    })
  }

  function createHash(){

    var hash = crypto.createHash('sha256'), hasher

    return hasher = pull.through(function(data){
      hash.update(data)
    }, function(){
      hasher.digest = '&' + hash.digest('base64') + '.sha256'
    })

  }

}
