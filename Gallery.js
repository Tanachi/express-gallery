var fs = require('fs');
var path = require('path');
var FILEPATH = path.resolve('data', 'gallery.json');
module.exports = {
  create:addgallery,
  display:displayGallery,
  view: seePicture,
  delete:deleteGallery
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
    galleries.splice(id, 1);
    console.log(galleries);
    fs.writeFile(FILEPATH, JSON.stringify(galleries), 'utf8', function(err){
    });
    res.render('index', { pictures: galleries});
  });
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

function seePicture(id,res){
   fs.readFile(FILEPATH, 'utf8', function(err, DATAFILE){
    if(err)
      throw err;
    var galleries = JSON.parse(DATAFILE);
    res.render('gallery', { num:id,url: galleries[id].url, author: galleries[id].author, description:galleries[id].description});
  });
}