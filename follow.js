var swarmlog = require('swarmlog')
var memdb = require('memdb')
var h = require('hyperscript')
var flavors = require('markdown-av')

var webtorrent = require('webtorrent')
var wt = new webtorrent

wt.on('error', function(err){
  console.log(err)
})
var log = swarmlog({
  publicKey: require('./keys2.json').public,
  sodium: require('chloride/browser'),
  db: memdb(),
  valueEncoding: 'json',
  hubs: [ 'http://10.0.0.2:11111' ]
})

log.createReadStream({ live: true })
  .on('data', function (data) {
    log.heads(function(err, heads){
    //  console.log(heads)
    })
    data = JSON.parse(JSON.parse(data.value))
    console.log(data)
    if(data.mentions){
      data.mentions.forEach(function(e){
        if(e.magnetURI){
          wt.add(e.magnetURI, function(torrent){
            torrent.files.forEach(function(file){
              var type = e.type.split('/')[0]
              var node = type
              if(type==='image')  node = 'img'
              node = h('p')
              node.style.width = node.style.height = '101px'
              console.log(node)
              file.appendTo(node)
              document.body.appendChild(node)
            })
          })
        }
      })
    }
    //console.log(flavors(data.text))
    var node = h('p', data.text + '\n')
    document.body.appendChild(node)
  })
