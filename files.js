  filebutton.create({accept: 'audio/*'}).on('fileinput',function(input){
    _import(input.files, function(files){
      files.forEach(function(e){
        var _sample = createSample(e.buffer, function(_sample){
          var n = files[0].name
          n = n.slice(0, n.lastIndexOf('.'))
          _sample.name = n
          sample = _sample
          _sample.index = samples.length
          samples.push(_sample)
        })
      })
    })
  }).mount(menui.import)
