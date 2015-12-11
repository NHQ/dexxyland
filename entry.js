var filebutton = require('file-button')
var button = document.querySelector('button')
var post = document.querySelector('#post')
var _import = require('./import')
var xhr = require('hyperquest')
var _file = null

filebutton.create({multiple: false}).on('fileinput',function(input){
  _import(input.files, function(err, files){
    if(err) console.log(err)
    _file = files[0]
    files.forEach(function(e){
      console.log(e)
    })
  })
}).mount(button)

post.addEventListener('click', function(){
  var body = _file ? _file : undefined 
  var dat = {}
  dat.type = body.type
  dat.name = body.name
  dat.size = body.size
  dat.text = document.querySelector('textarea').value || ''
  var req = xhr.post(window.location.href + new Buffer(JSON.stringify(dat)).toString('base64'), function(er, res){
    console.log(er, res)
  })

  req.end(body)
})

