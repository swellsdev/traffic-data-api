var config  = require('./config')
var express = require('express')
var mongo = require('mongodb')
var monk = require('monk')
var cors = require('cors')
var bodyParser = require('body-parser');
var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(cors())
app.set('port', config.port);

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var mongoURI = "mongodb://"+config.username+":"+config.password
	+"@ds051851.mongolab.com:51851/vicroads-segment-speed";
var mongoDB;
MongoClient.connect(mongoURI, function(err, db) {
  	assert.equal(null, err);
  	console.log("Connected correctly to server");
  	console.log(db.databaseName);
  	GetLocations(db, function(result){
  		locations = result;
  		mongoDB = db;
  	});
});

// health check
app.get('/', function (req, res) {
  	res.send('Service OK');
});

// get full list of locations
app.get('/locations', function (req, res) {
  res.send({data:locations});
});

// get all data for a single survey
app.get('/surveyData', function (req, res) {
  var surveyID = req.query.ID;
  GetAllDataFromSurveyID(mongoDB,surveyID,function(result){
    res.send(result);
  });
});

// get locations near a point
app.post('/dataFromLocations', function (req, res) {
  var locationsRequested = req.body.locations;
    GetDataFromLocations(mongoDB,locationsRequested,function(result){
      res.send(result);
    });
});

// start server listening
var server = app.listen(5000, function () {
  var host = server.address().address;
  var port = 5000;
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
 
function GetDataFromLocations(db,locationsRequested,callback){
  //convert to floats
  var array = [];
  for(i=0;i<locationsRequested.length;i++){
    var obj = {};
    obj["LAT"] = Number(parseFloat(locationsRequested[i].LAT).toFixed(10));
    obj["LONG"] = Number(parseFloat(locationsRequested[i].LONG).toFixed(10));
    array.push(obj);
  }

  var collection = db.collection('locations');
  
  //Find IDs matching the locations given
  collection.find({"$or":array},{_id:0,ID:1})
    .toArray(function(err,result){
      if(err)
        console.log(err);
      GetDataFromLocationID(db,result,callback);
  });
}

function GetDataFromLocationID(db,locationIDs,callback){
  //convert ID field name
  var array = [];
  for(i=0;i<locationIDs.length;i++){
    var obj = {};
    obj["NB_LOCATION_TRAFFIC_SURVEY"] = locationIDs[i].ID;
    array.push(obj);
  }

  var collection = db.collection('data');
  collection.aggregate(
    {
      $match:{"$or":array}
    },
    {
      $group:{ 
        _id : {
          NB_LOCATION_TRAFFIC_SURVEY:"$NB_LOCATION_TRAFFIC_SURVEY",
          NB_TRAFFIC_SURVEY:"$NB_TRAFFIC_SURVEY",
          DS_HOMOGENEOUS_FLOW:"$DS_HOMOGENEOUS_FLOW"
        }
      }
    },
    function(err,result){
      if(err)
        console.log(err);
      callback(result);
    }
  );
}

function GetAllDataFromSurveyID(db,surveyID,callback){
  var collection = db.collection('data');
  collection.find({"NB_LOCATION_TRAFFIC_SURVEY":Number(surveyID)})
    .toArray(function(err,result){
      if(err)
        console.log(err);
      callback(result);
  });
}