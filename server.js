var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var settings= require('./config.json');
var querystring = require('querystring');
var RedisStore = require('connect-redis')(session);
var fs = require('fs');
var db = require('./models');
var app = express();
var Gallery = db.Photos;
var Admins = db.User;
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(session({
  store: new RedisStore(),
  secret: settings.SESSION.secret,
  resave: true,
  saveUninitialized: false
}));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


function authenticate(username, password) {
  return Admins.findOne({
    where: {
      username: username,
      password: password
    }
  });
}

passport.use(new LocalStrategy(
  function (username, password, done) {
    var isAuthenticated = authenticate(username, password).then(function(loginInfo) {
      if (!loginInfo) {
        return done(null, false);
      }
      console.log(loginInfo);
        var user = {
        name: "Bob",
        role: "ADMIN",
        color: "orange"
      }
    return done(null, user);
    });
  }
));

function isAuthenticated (req, res, next) {
  req.session.dest = req.url;
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  return next();
}

app.use(passport.initialize());
app.use(passport.session());

app.use(urlencodedParser, methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// link http://media-hearth.cursecdn.com/avatars/147/957/264.png

app.put(/\/gallery\/\d+/, function (req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  var mainPicture;
  var otherPictures = [];
  var updateInfo = {};

  Gallery.findOne({id: numID}).then(function(gallery) {
    if(gallery !== []){
      if(req.body.url !== ''){
        updateInfo.url = req.body.url;
      }
      else{
        updateInfo.url = gallery.dataValues.url;
      }
      if(req.body.author !== ''){
        updateInfo.author = req.body.author;
      }
      else{
        updateInfo.author = gallery.dataValues.author;
      }
      if(req.body.description !== ''){
        updateInfo.description = req.body.description;
      }
      else{
        updateInfo.description = gallery.dataValues.description;
      }
      Gallery.update(updateInfo,
        {where:{id:gallery.dataValues.id}}).then(function(updatedObjects) {
        mainPicture =updateInfo;
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
        res.render('gallery', {mainPicture: mainPicture,
                              otherPictures:otherPictures});
        });
      });
    }
    else
      res.render('404');
  });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      var gogo  = req.session.dest;
      req.session.dest = null;
      return res.redirect(gogo);
    });
  })(req, res, next);
});
app.get('/login', function(req, res) {
  res.render('login');
});


app.delete(/\/gallery\/\d+/, isAuthenticated,
  function(req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
   Gallery.destroy({
    where: {
      id: numID
    }
  }).then(function(promise) {
    if(promise !== 0){
      return res.redirect('/');
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


app.get(/\/gallery\/\d+\/edit/, isAuthenticated,function(req, res) {
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

app.get('/gallery/new',isAuthenticated, function(req, res) {
    res.render('new');
  });

app.get('/secret', isAuthenticated,
  function (req, res) {
    res.render('secret');
  }
);
app.post('/gallery', function (req, res) {
  Gallery.create({ author: req.body.author,
                  url: req.body.url,
                  description:req.body.description})
    .then(function (gallery) {
      res.render('gallery', {mainPicture:req.body});
  });
});
var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  db.sequelize.sync();
  console.log('listening on',host, port);
});