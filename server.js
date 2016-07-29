var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var querystring = require('querystring');
var fs = require('fs');
var db = require('./models');
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var Gallery = db.Photos;

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(urlencodedParser, methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.put(/\/gallery\/\d+/, function (req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  var updateInfo = {};
  if(req.body.url !== ''){
    updateInfo.url = req.body.url;
  }
  if(req.body.author !== ''){
    updateInfo.author = req.body.author;
  }
  if(req.body.description !== ''){
    updateInfo.description = req.body.description;
  }
  Gallery.update(updateInfo, {
    where: {
      id: numID
    }
  }).then(function(gallery) {
    if(gallery.length !== 0){
      res.render('gallery', {num:gallery.id, url: req.body.url,
                          author:req.body.author,
                          description:req.body.description})
    }
    else{
      res.render('404');
    }
  });
});

app.delete(/\/gallery\/\d+/, function (req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
   Gallery.destroy({
    where: {
      id: numID
    }
  }).then(function(promise) {
    if(promise !== 0){
      Gallery.findAll({ author: req.body.author, url: req.body.url, description: req.body.description})
      .then(function (gallery) {
        res.render('index', {pictures: gallery});
      });
    }
    else{
      res.render('404');
    }
  });
});

app.get('/', function(req, res){
  Gallery.findAll({ author: req.body.author, url: req.body.url, description: req.body.description})
    .then(function (gallery) {
      var bigPicture;
      var pictureRow = [];
      var pictureArray = [];
      var rowCount = 3;
      while(gallery.length > 0){
        if(rowCount > 0){
          pictureRow.push({author:gallery[0].dataValues.author,
                          description:gallery[0].dataValues.description,
                          url:gallery[0].dataValues.url,
                          id:gallery[0].dataValues.id});
          gallery.splice(0,1);
          rowCount--;
        }
        else{
          pictureArray.push(pictureRow);
          pictureRow = [];
          rowCount = 3;
        }
      }
      pictureArray.push(pictureRow);
      res.render('index', {pictures: pictureArray});
  });
});


app.get(/\/gallery\/\d+\/edit/, function(req, res){
  var split = req.url.split('/');
  var numID = split[2];
  Gallery.findAll({
    where: {
      id: numID
    }
  }).then(function (gallery) {
    if(gallery.length !== 0){
      res.render('edit', { num:gallery[0].dataValues.id,
                        url: gallery[0].dataValues.url,
                        author: gallery[0].dataValues.author,
                        description:gallery[0].dataValues.description});
    }
    else{
      res.render('404');
    }
  });
});

app.get(/\/gallery\/\d+/, function(req, res){
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  Gallery.findAll({
    where: {
      id: numID
    }
  }).then(function (gallery) {
    if(gallery.length !== 0){
      res.render('gallery', { num:gallery[0].dataValues.id,
                        url: gallery[0].dataValues.url,
                        author: gallery[0].dataValues.author,
                        description:gallery[0].dataValues.description});
    }
    else{
      res.render('404');
    }
  });
});

app.get('/gallery/new', function(req, res){
  res.render('new');
});


app.post('/gallery', function (req, res) {
  Gallery.create({ author: req.body.author, url: req.body.url, description:req.body.description})
    .then(function (gallery) {
      res.render('gallery', { num:gallery.id,url: req.body.url, author: req.body.author, description:req.body.description});
  });
});
var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  db.sequelize.sync();
  console.log('listening on',host, port);
});