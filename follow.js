var swarmlog = require('swarmlog')
var memdb = require('memdb')
var h = require('hyperscript')
var flavors = require('../markdown-av')

var webtorrent = require('webtorrent')
var wt = new webtorrent

wt.on('error', function(err){
  console.log(err)
})
var log = swarmlog({
  publicKey: require('./keys.json').public,
  sodium: require('chloride/browser'),
  db: memdb(),
  valueEncoding: 'json',
  hubs: [ 'http://localhost:11111', 'https://signalhub.mafintosh.com']
})

log.createReadStream({ live: true })
  .on('data', function (data) {
    log.heads(function(err, heads){
    //  console.log(heads)
    })
    data = JSON.parse(JSON.parse(data.value))
    console.log(data.mentions)
    var parsed = flavors(data.text, function(node, link){
        data.mentions.forEach(function(e){
          if(e.link === link){

            wt.add(e.magnetURI, function(torrent){
              torrent.files.forEach(function(file){
                //var type = e.type.split('/')[0]
                //var node = type
                //if(type==='image')  type = 'img'
                //var el = document.createElement(type)
                console.log(node)
                file.appendTo(node)
                //node.parentElement.replaceChild(el, node)
                document.body.appendChild(node)
              })
            })
          }
        })
    })
    //console.log(flavors(data.text))
    console.log(parsed)
    var box = h('div')
    box.innerHTML = parsed
    document.body.appendChild(box)
  })
