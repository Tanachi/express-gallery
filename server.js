var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var Gallery = require('./Gallery');
var querystring = require('querystring');
var fs = require('fs');
var app = express();
var FILEPATH = path.resolve('data', 'gallery.json');
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
var vistorCount = 0;
app.get('/', function(req, res){
  Gallery.display(res);
});

app.get(/\/gallery\/\d+/, function(req, res){
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  Gallery.view(numID, res);
});

app.get('/gallery/new', function(req, res){
  res.render('new');
});

app.get('/gallery/:id/edit', function(req, res){
  res.send('you are editing ' + req.params.id);
});


app.post('/gallery', function (req, res) {
  req.on('data', function (chunk) {
    var data = chunk.toString();
    var info = querystring.parse(data);
    Gallery.create(info, function(err, result) {
      if(err)
        throw err;
      res.render('gallery', result);
    });
  });
});

app.put('/gallery/:id', function (req, res) {
  req.on('data', function (chunk) {
    var data = chunk.toString();
    var info = querystring.parse(data);
    res.send('Editing a new photo ' + info.author + ' ' + info.url + ' ' + info.description);
  });
});

app.delete(/\/gallery\/\d+/, function (req, res) {
  var urlSplit = req.url.split(/\/gallery\//);
  var numID = urlSplit[1];
  Gallery.delete(numID, res);
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