var fs = require('fs');
var path = require('path');
var FILEPATH = path.resolve('data', 'gallery.json');
module.exports = {
  create:addgallery,
  display:displayGallery,
  view: seePicture,
  delete:deleteGallery,
  edit: editGallery
};

function addgallery(chunk, callback){
  fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    galleries.push(chunk);
    fs.writeFile(FILEPATH, JSON.stringify(galleries), 'utf8', function(err){
      callback(err, chunk);
    });
  });
}

function deleteGallery(id, res){
   fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    if(galleries.length < id){
      var badErr = new Error('id is greater than index');
      return badErr;
    }
    galleries.splice(id, 1);
    fs.writeFile(FILEPATH, JSON.stringify(galleries), 'utf8', function(err){
      if(err)
        throw err;
    });
    res.render('index', { pictures: galleries});
  });
}

function displayGallery(res){
  fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    if(galleries.length < id){
      var badErr = new Error('id is greater than index');
      return badErr;
    }
    res.render('index', { pictures: galleries});
  });
}

function editGallery(id, chunk, res){
   fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    if(galleries.length < id){
      var badErr = new Error('id is greater than index');
      return badErr;
    }
    galleries[id].url = chunk.url;
    galleries[id].author = chunk.author;
    galleries[id].description = chunk.description;
    console.log(galleries);
    fs.writeFile(FILEPATH, JSON.stringify(galleries), 'utf8', function(err){
      if(err)
        throw err;
    });
    res.render('gallery', { num:id,url: galleries[id].url, author: galleries[id].author, description:galleries[id].description});
  });
}

function seePicture(id,res){
   fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    if(galleries.length < id){
      var badErr = new Error('id is greater than index');
      return badErr;
    }
    res.render('gallery', { num:id,url: galleries[id].url, author: galleries[id].author, description:galleries[id].description});
  });
}