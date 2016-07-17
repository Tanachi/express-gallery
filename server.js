var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Gallery = require('./Gallery');
var querystring = require('querystring');
var fs = require('fs');
var app = express();
var FILEPATH = path.resolve('data', 'gallery.json');
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
var vistorCount = 0;
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
  Gallery.edit(req.body._id, req.body, function(err, result){
      if(err)
        throw err;
    res.render('gallery', { num:req.body._id,url: result.url, author: result.author, description:result.description});
  });
});

app.delete(/\/gallery\/\d+/, function (req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  Gallery.delete(numID, function(err, result) {
    if(err)
      throw err;
    res.render('index', { pictures: result});
  });
});

app.get('/', function(req, res){
  Gallery.display(function(err, result){
    if(err)
      throw err;
    res.render('index', {pictures: result});
  });
});


app.get(/\/gallery\/\d+\/edit/, function(req, res){
  var split = req.url.split('/');
  var numID = split[2];
  Gallery.view(numID, function(err, result){
    if(err)
      throw err;
    res.render('edit', { num:numID,url: result.url, author: result.author, description:result.description});
  });
});

app.get(/\/gallery\/\d+/, function(req, res){
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  Gallery.view(numID, function(err, result){
    if(err)
      throw err;
    res.render('gallery', { num:numID,url: result.url, author: result.author, description:result.description});
  });
});

app.get('/gallery/new', function(req, res){
  res.render('new');
});


app.post('/gallery', function (req, res) {
  Gallery.create(req.body, function(err, result) {
    if(err)
      throw err;
    res.render('gallery', { num:result.id,url: result.url, author: result.author, description:result.description});
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

  console.log('listening on',host, port);
});