var express = require('express');
var querystring = require('querystring');
var app = express();
app.get('/', function(req, res){
  res.send('View list of galleries');
});

app.get('/gallery/:id', function(req, res){
  res.send('you are viewing ' + req.params.id);
});

app.get('/gallery/new', function(req, res){
  res.send('new photo');
});

app.get('/gallery/:id/edit', function(req, res){
  res.send('you are editing ' + req.params.id);
});


app.post('/gallery', function (req, res) {
  req.on('data', function (chunk) {
    var data = chunk.toString();
    var info = querystring.parse(data);
    res.send('posting a new photo ' + info.author + ' ' + info.url + ' ' + info.description);
  });
});

app.put('/gallry/:id', function (req, res) {
  req.on('data', function (chunk) {
    var data = chunk.toString();
    var info = querystring.parse(data);
    res.send('posting a new photo ' + info.author + ' ' + info.url + ' ' + info.description);
  });
});

app.delete('/gallery/:id', function (req, res) {
  res.send('Deleting photo ' + req.params.id);
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