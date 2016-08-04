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
      if (!loginInfo.dataValues.id) {
        return done(null, false);
      }
        console.log('hello');
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

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
  })
);


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

app.get('/secret',
  function (req, res) {
    res.render('secret');
  }
);
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