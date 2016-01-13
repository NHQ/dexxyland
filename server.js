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

var server = http.createServer(handler)
var serve = ecstatic('./public')
answer(server, 11001)

server.on('listening', function(){
  console.log('address is: http://' + ip.private() + ':' + server.address().port)
})

function handler (req, res){

  if(req.method === 'POST'){
    var p = req.url.split('/')
    p.shift()
    var q = p[1].length ? JSON.parse(new Buffer(p[1], 'base64').toString('utf8')) : {}
    if(p[0] === 'blob') sblob(req, res, q)
    else if(p[0] === 'hash') hashBlob(req, res, q)
    else if(p[0] === 'text'){
      ssbc(function(e, sbot){
        sbot.publish({type: 'post', text: q.text, mentions: q.mentions}, function(err){
          if(err) console.log(err)
          res.writeHead(err ? 400 : 200)
          res.end()
        })
      })
    }
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
          res.writeHead(err ? 400 : 200)
          res.end(JSON.stringify({hash: hasher.digest}))
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
