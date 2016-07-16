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

function deleteGallery(id, callback){
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
      callback(err, galleries);
    });
  });
}

function displayGallery(callback){
  fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    callback(err, galleries);
  });
}

function editGallery(id, chunk, callback){
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
    fs.writeFile(FILEPATH, JSON.stringify(galleries), 'utf8', function(err){
      if(err)
        throw err;
      callback(err, chunk);
    });
  });
}

function seePicture(id,callback){
   fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    if(galleries.length < id){
      var badErr = new Error('id is greater than index');
      return badErr;
    }
    console.log(id);
    var chunk = {
      url:galleries[id].url,
      author:galleries[id].author,
      description:galleries.description
    };
    callback(err, chunk);
  });
}