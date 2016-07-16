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
      var info = {
        url: chunk.url,
        author: chunk.author,
        description: chunk. description,
        id: galleries.length - 1
      };
      callback(err, info);
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
    var numID;
    if(isNaN(id)){
      var myRegexp = /(\d)\?/;
      var match = myRegexp.exec(id);
      if(match !== null){
        numID = match[1];
      }
    }
    else{
      numID = id;
    }

    var galleries = JSON.parse(DATAFILE);
    if(galleries.length < numID){
      var badErr = new Error('id is greater than index');
      return badErr;
    }
    console.log(numID);
    var chunk = {
      url:galleries[numID].url,
      author:galleries[numID].author,
      description:galleries[numID].description
    };
    callback(err, chunk);
  });
}