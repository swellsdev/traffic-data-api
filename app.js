var config  = require('./config')
var express = require('express')
var mongo = require('mongodb')
var monk = require('monk')
var app = express()
app.set('port', config.port);
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var mongoURI = "mongodb://"+config.username+":"+config.password
	+"@ds051851.mongolab.com:51851/vicroads-segment-speed";

MongoClient.connect(mongoURI, function(err, db) {
  	assert.equal(null, err);
  	console.log("Connected correctly to server");
  	console.log(db.databaseName);
  	GetLocations(db, function(result){
  		locations = result;
  		db.close();
  	});
});

// health check
app.get('/', function (req, res) {
  	res.send('Service OK');
});

// get locations
app.get('/locations', function (req, res) {
  res.send(locations);
});

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Traffic service listening at http://%s:%s', host, port);
});

function GetLocations(db,callback){
	var collection = db.collection('locations');
	collection.find({},{
		"ID":true,
		"LAT":true,
		"LONG":true,
		"_id":false
	}).toArray(function(err,result){
		callback(result);
	});
}