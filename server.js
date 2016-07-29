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
  }).then(function(promise) {
    res.render('gallery', {num:promise.id, url: req.body.url,
                          author:req.body.author,
                          description:req.body.description})
  });
});

app.delete(/\/gallery\/\d+/, function (req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
   Gallery.destroy({
    where: {
      id: numID
    }
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
  Gallery.findAll({
    where: {
      id: numID
    }
  }).then(function (gallery) {
    res.render('edit', { num:gallery[0].dataValues.id,
                        url: gallery[0].dataValues.url,
                        author: gallery[0].dataValues.author,
                        description:gallery[0].dataValues.description});
  });
});

app.get(/\/gallery\/\d+/, function(req, res){
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  Gallery.findAll({ author: req.body.author, url: req.body.url, description: req.body.description})
    .then(function (gallery) {
      console.log(gallery);
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