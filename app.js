var config  = require('./config')
var express = require('express')

var app = express()

app.set('port', config.port);

// health check
app.get('/', function (req, res) {
  res.send('Service OK');
});

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});