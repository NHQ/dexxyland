var filebutton = require('file-button')
var runp = require('run-parallel')
var concat = require('concat-stream')
var button = document.querySelector('button')
var post = document.querySelector('#post')
var _import = require('./import')
var xhr = require('hyperquest')
var _file = null
var _files = []
var hashedBlobs = []

filebutton.create({multiple: true}).on('fileinput',function(input){
  _import(input.files, function(err, files){
    if(err) console.log(err)
    _files = files
    _file = files[0]
    files.forEach(function(e){
      console.log(e)
    })
  })
}).mount(button)

var last = 0

post.addEventListener('click', function(e){
  if(e.timestamp - last < 300) return
  last = e.timestamp
  if(_files.length){
    var tasks = _files.map(function(e){
      var dat = {}
      dat.type = e.type
      dat.name = e.name
      dat.size = e.size
      dat = new Buffer(JSON.stringify(dat)).toString('base64')
      return function(cb){
        var req = xhr.post(window.location.origin + '/hash/' + dat, function(e, r){
          if(e) cb(e, null)
          r.pipe(concat(function(res){
            res = JSON.parse(res)
            console.log(res)
            hashedBlobs.push(res)
            cb(null, res)
          }))
        })
        req.end(e)
      }
    })
    runp(tasks, function(e, res){
      console.log(e, res)
      if(!e){
        hashedBlobs.forEach(function(e){
          var val = e.type.match('image/*') ? '\n\n!['+e.name+']('+e.hash+')' : '\n\n['+e.name+']('+e.hash+')'
          document.querySelector('textarea').value += val 
        })
        var text = document.querySelector('textarea').value
        text = new Buffer(JSON.stringify({text: text})).toString('base64')
        var req = xhr.post(window.location.origin + '/text/' + text, function(e,r){
          //console.log(e,r)
        })
        req.end()
      }
    })
  }
})

/*
post.addEventListener('click', function(){
  var body = _file ? _file : undefined 
  var dat = {}
  if(body){
    dat.type = body.type
    dat.name = body.name
    dat.size = body.size
  }
  dat.text = document.querySelector('textarea').value || ''
  var url = window.location.origin + '/'
  if(body) url += 'blob/'
  else url += 'text/'
  url += new Buffer(JSON.stringify(dat)).toString('base64')
  var req = xhr.post(url, function(er, res){
    console.log(er, res)
  })

  req.end(body)
})
*/
