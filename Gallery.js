var fs = require('fs');
var path = require('path');
var FILEPATH = path.resolve('data', 'gallery.json');
module.exports = {
  create:addgallery,
  display:displayGallery
};

function addgallery(chunk, callback){
  fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    galleries.push(chunk);
    console.log(galleries);
    fs.writeFile(FILEPATH, JSON.stringify(galleries), 'utf8', function(err){
      callback(err, chunk);
    });
  });
}

function deletegallery(){

}

function displayGallery(res){
  fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    res.render('index', { pictures: galleries});
  });
}

function editgallery(){

}

function seePicture(id){
  console.log(id);
}