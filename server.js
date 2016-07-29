var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var querystring = require('querystring');
var fs = require('fs');
var db = require('./models');
var app = express();
var Gallery = db.Photos;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static(path.resolve(__dirname, 'public')));

var user = { username: 'tyler', password: 'goodbye', email: 'bob@example.com' };
passport.use(new BasicStrategy(
  function(username, password, done) {
    // Example authentication strategy using
    if ( !(username === user.username && password === user.password) ) {
      return done(null, false);
    }
    return done(null, user);
}));

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

app.delete(/\/gallery\/\d+/,
  passport.authenticate('basic', { session: false }),function(req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
   Gallery.destroy({
    where: {
      id: numID
    }
  }).then(function(promise) {
    if(promise !== 0){
      Gallery.findAll({ author: req.body.author,
                  url: req.body.url,
                  description: req.body.description})
      .then(function (gallery) {
        var bigPicture;
        var pictureArray = [];
        while(gallery.length > 0){
         pictureArray.push(gallery.splice(0,3));
        }
        res.render('index', {pictures: pictureArray});
      });
    }
    else{
      res.render('404');
    }
  });
});

app.get('/', function(req, res){
  Gallery.findAll({ author: req.body.author,
                  url: req.body.url,
                  description: req.body.description})
    .then(function (gallery) {
      var bigPicture;
      var pictureArray = [];
      while(gallery.length > 0){
       pictureArray.push(gallery.splice(0,3));
      }
      res.render('index', {pictures: pictureArray});
  });
});


app.get(/\/gallery\/\d+\/edit/,
  passport.authenticate('basic', { session: false }),function(req, res) {
  var split = req.url.split('/');
  var numID = split[2];
  Gallery.findOne({
    where: {
      id: numID
    }
  }).then(function (gallery) {
    if(gallery.length !== 0){
      res.render('edit', { num:gallery.dataValues.id,
                        url: gallery.dataValues.url,
                        author: gallery.dataValues.author,
                        description:gallery.dataValues.description});
    }
    else{
      res.render('404');
    }
  });
});

app.get(/\/gallery\/\d+/, function(req, res){
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  var mainPicture;
  var otherPictures = [];
  Gallery.findOne({
    where: {
      id: numID
    }
  }).then(function (gallery) {
    if(gallery !== [])
      mainPicture = gallery.dataValues;
    else
      res.render('404');
  });
  Gallery.findAll({
    where: {
      id: {
        $gt: numID
      }
    },
      limit: 3
  }).then(function(other) {
    if(other[0])
      otherPictures.push(other[0].dataValues);
    if(other[1])
      otherPictures.push(other[1].dataValues);
    if(other[2])
      otherPictures.push(other[2].dataValues);
    res.render('gallery', {mainPicture: mainPicture, otherPictures:otherPictures});
  });
});

app.get('/gallery/new',passport.authenticate('basic', { session: false }),function(req, res) {
    res.render('new');
  });


app.post('/gallery', function (req, res) {
  Gallery.create({ author: req.body.author,
                  url: req.body.url,
                  description:req.body.description})
    .then(function (gallery) {
      res.render('gallery', { num:gallery.id,url: req.body.url,
                            author: req.body.author,
                            description:req.body.description});
  });
});
var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  db.sequelize.sync();
  console.log('listening on',host, port);
});