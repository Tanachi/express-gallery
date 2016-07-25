var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Gallery = require('./Gallery');
var querystring = require('querystring');
var fs = require('fs');
var db = require('./models');
var app = express();
var FILEPATH = path.resolve('data', 'gallery.json');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var Gallery = db.Gallery;

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(urlencodedParser, methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    console.log('hello');
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.put(/\/gallery\/\d+/, function (req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  Gallery.find({id:numID}).then(function(gallery) {
    // now you see me...
  return Gallery.update({
    author: req.author,
    url: req.url,
    description: req.description
  });
  }).then(function(gallery) {
    res.render('gallery', { num:gallery.id,url: req.body.url, author: req.body.author, description:req.body.description});
  });
});

app.delete(/\/gallery\/\d+/, function (req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  console.log(numID);
  Gallery.findOne({where:{id:numID}}).then(function(gallery) {
    // now you see me...
  return gallery.destroy();
  }).then(function() {
    Gallery.findAll({ author: req.body.author, url: req.body.url, description: req.body.description})
      .then(function (gallery) {
        res.render('index', {pictures: gallery});
    });
  });
});

app.get('/', function(req, res){
  Gallery.findAll({ author: req.body.author, url: req.body.url, description: req.body.description})
    .then(function (gallery) {
      res.render('index', {pictures: gallery});
  });
});


app.get(/\/gallery\/\d+\/edit/, function(req, res){
  var split = req.url.split('/');
  var numID = split[2];
  Gallery.findAll({ author: req.body.author, url: req.body.url, description: req.body.description})
    .then(function (gallery) {
      res.render('edit', { num:gallery[numID].dataValues.id,url: gallery[numID].dataValues.url, author: gallery[numID].dataValues.author, description:gallery[numID].dataValues.description});
  });
});

app.get(/\/gallery\/\d+/, function(req, res){
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  Gallery.findAll({ author: req.body.author, url: req.body.url, description: req.body.description})
    .then(function (gallery) {
      res.render('gallery', { num:gallery[numID].dataValues.id,url: gallery[numID].dataValues.url, author: gallery[numID].dataValues.author, description:gallery[numID].dataValues.description});
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



// app.route('/book')
//   .get(function (req, res) {
//     res.send('get a book');
//   })
//   .post(function (req, res) {
//     res.send('add a book');
//   })
//   .put(function (req, res) {
//     res.send('edit a book');
//   })
//   .delete(function (req, res) {
//     res.send('delete a book');
// });

var server = app.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  db.sequelize.sync();
  console.log('listening on',host, port);
});