var crypto = require('crypto')
var createHash = require('sha.js')

var pull = require('pull-stream')
var marked = require('marked')
var filebutton = require('file-button')
var runp = require('run-parallel')
var concat = require('concat-stream')
var lookup = require('mime-types').lookup

var msg = require('jssb-ref')
var flavors = require('markdown-av')
var bot = require('./swarm')
var webtorrent = require('webtorrent')

var wt = new webtorrent

marked.setOptions({
  smartyPants: true, 
  sanitize: true
})

var button = document.querySelector('button')
var post = document.querySelector('#post')
var textarea = document.querySelector('textarea')
var preview = document.querySelector('#preview')
var _import = require('./import')
var xhr = require('hyperquest')
var _file = null
var _files = []
var hashedBlobs = []
var FILES = []


textarea.addEventListener('keyup', function(e){
  preview.innerHTML = ''
  var val = this.value
  var dummy = document.createElement('div')
  //var postMark = marked(val)
  dummy.innerHTML = flavors(val)
  var alts = dummy.querySelectorAll('[data-halp=true]')
  alts = Array.prototype.map.call(alts, function(e){
    var src = e.dataset['src']
    var ext = src.slice('.')[-1]
    var match = lookup(src).match('(audio|video|image)\/*')
    var type = null
    if(match) type = match[1] === 'image' ? 'img' : match[1]
    if(type){
      var node = document.createElement(type)
      node.src = src
      if(type === 'video' || type === 'audio') node.controls = true
      return [e, node]
      
    }
    else return false
  }).filter(Boolean).forEach(function(e){
    e[0].parentNode.replaceChild(e[1], e[0])
  })
  preview.innerHTML = dummy.innerHTML.toString()
  
})

filebutton.create({multiple: true}).on('fileinput',function(input){
  _import(input.files, function(err, files){
    if(err) console.log(err)
    files = files.map(function(e){
      var hash = createHash('sha256')
      hash.update(e)
      e.hash = '&' + hash.digest('base64') + '.sha256'
      var val = e.type.match('image/*') ? '\n\n!['+e.name+']('+e.hash+')' : '\n\n['+e.name+']('+e.hash+')'
      document.querySelector('textarea').value += val 
      return e
    })
    FILES = FILES.concat(files)
  })
}).mount(button)

var last = 0

post.addEventListener('click', function(e){
  if(e.timestamp - last < 300) return
  last = e.timestamp
  var t = document.querySelector('textarea').value

  _files = FILES.map(function(e){
    var r = new RegExp('['+e.hash+']')
    if(r.test(t)) return e
    else return false
  }).filter(Boolean)
  if(true || _files.length){
    var tasks = _files.map(function(e){
      var dat = {}
      dat.type = e.type
      dat.name = e.name
      dat.size = e.size
      dat.hash = e.hash
      return function(cb){
//        console.log(e)
        wt.seed([e], function(torrent){
          e.infoHash = torrent.infoHash
          e.magnetURI = torrent.magnetURI
          cb(null, torrent)
        })
      }
    })
    runp(tasks, function(e, res){
      if(!e){ // blobs uploaded
        var text = document.querySelector('textarea').value
        var mentions = _files.map(function(e){
          return {link: e.hash, name: e.name, type: e.type, size: e.size, infoHash: e.infoHash, magnetURI: e.magnetURI}
        })
        var otherMentions = msg.mentionIt(text)
        otherMentions = otherMentions.filter(function(e){
          var dupe = false
          mentions.forEach(function(m){
            if(m.link === e.link) dupe = true
          })
          return !dupe
        })
        mentions = mentions.concat(otherMentions)
        text = new Buffer(JSON.stringify({text: text, mentions: mentions})).toString('utf8')
        textarea.value = JSON.stringify(text)    
        bot.append(textarea.value, function(err, da){
          //console.log(err, da)
          if(err) console.log(err)
          else FILES = []
        }) 
      
      }
    })
  }
})

