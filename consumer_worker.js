
var clientC = require('beanstalk_client').Client;
var request = require("request");
var cheerio = require("cheerio");
var mongodb = require('mongodb'),format = require('util').format;
var Promise = require("bluebird");
var co = require('co');


var sucCount = 10;
var failCount = 3;

var reqHost = Promise.promisify(request);
var clinetB = Promise.promisify(clientC.connect);
var reqdata = {
 	 url: 'http://challenge.aftership.net:9578/v1/beanstalkd',
     method : 'POST',
     json: true,
     headers:{
      'Content-Type': 'application/json',
      'aftership-api-key': 'a6403a2b-af21-47c5-aab5-a2420d20bbec'
      }
  	};
function *connDB(){
	var MongoClient = mongodb.MongoClient;
    var mongoConn = Promise.promisify(MongoClient.connect);
	var urlDB = 'mongodb://localhost:27017/JSHello';		
	var db = yield mongoConn(urlDB);
	return db;	
};


//Program begins.............
 co(function *(){
 	const response = yield reqHost(reqdata);
 	const BeanHost = response.body.data.host + ':' + response.body.data.port;
 	var conn = yield clinetB(BeanHost);
 
 	conn.watch('FionaWai',function(err,xx){
 		conn.reserve(function(err, jobid, payload) {
 		    if (err){
				conn.release(jobid,0,3,function(err){
			  	console.log('Release job with delay 3sec:' + jobid);
			  }); 
			} else {
				
			//	conn.release(jobid,0,60,function(err){
			//  	console.log('Release job with delay 60sec:' + jobid);
			//  }); 

				console.log('Got a job: ' + jobid + '; Got job data: ' + payload);
			 	
				var num = 0;
       			 var i = setInterval(function() {
        				    ++num;
       					    findRate1(payload);
      					    if (num > 9) { 
      					    	clearInterval(i);
      					    	
								var MongoClient = mongodb.MongoClient;
								MongoClient.connect('mongodb://localhost:27017/JSHello', 
									function (err, db) {
								if (err) {
								console.log('Unable to connect to the mongodb server. Error : ' + err);
								} else {
									console.log('Mongodb connected');
 			    			        var flag = false;
        							var collection = db.collection('cRateCount');
									collection.find({}).toArray(function(err, result){
									if (err){
										console.log(err);
									} else if (result.length){
										console.log(result);
										if (((result[0].successed) <= 1) || ((result[0].failed) <= 0)) {
											flag = true;
										} else flag = false;
					
									}					
									if (flag) {
										//Stop the task if you tried 10 succeed attempts or 3 failed attempts in total.
									} 	
									console.log(flag);
									db.close();  
									MongoClient.disconnect;
			    				 
									});	        
								}
 								 });
      					    } 
      					    	
      					  }, 60000);
       			conn.quit;
				clientC.disconnect;
			};	

 		});

 	});

 }) 

 
//Fetch XE.COM data & insert into mongodb
function findRate1(payload){
	
	var MongoClient = mongodb.MongoClient;
    var fecthRate   = Promise.promisify(request);
    var mongoConn   = Promise.promisify(MongoClient.connect);


    var FromCode = (JSON.parse(payload)).from;
    var ToCode   = (JSON.parse(payload)).to;


    var urlDB   = 'mongodb://localhost:27017/JSHello';
	var urlRate = "http://www.xe.com/currencyconverter/convert/?Amount=1&From=" 
				+ FromCode.toString()
				+ "&To=" + ToCode.toString();


		fecthRate(urlRate).then(function(response){ //get rate data
    	var $      = cheerio.load(response.body);
		var ExRate = $("span.uccResultAmount").text();
		var HKT    = $("span.resultTime").data('time');

		//get 2.p.d
		var NoExRate  = parseFloat(ExRate.replace(",", ""));
		ExRate = NoExRate.toFixed(2).toString();

		return rate1 = {
			From      : FromCode, 
			To        : ToCode,
			created_at: HKT, 
			rate      : ExRate};
		
		})
		.then(function(rate1){  // insert rate data into mongodb
		  	mongoConn(urlDB).then(function(db){
			var collection = db.collection('xeRate');
			collection.insert([rate1], function(err, result){
				if (err) {
					console.log(err);
				} else {
					console.log('No. ' + sucCount + ' insert successed!')
					--sucCount;
				}
			});		
			db.close();
			})
			
	    return true;    
		})
		.catch(function(err) {	
			console.error(err);	
			--failCount;	
    	});
    	    	
    	co(function *(){
 		   var db = yield connDB();
	       var count = {
				successed : sucCount,
				failed : failCount
				};

			var collection = db.collection('cRateCount');
			collection.update({}, { '$set': count },{upsert : true},true,function (err, result) {
				if (err) {
					console.log(err);
				} else {

				}
				db.close();
			});
		}); 
		return true;

};

//readandDropDB();
function readandDropDB() {
	var flag = false;
	var MongoClient = mongodb.MongoClient;
	MongoClient.connect('mongodb://localhost:27017/JSHello', function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongodb server. Error : ' + err);
	} else {
		console.log('Mongodb connected');
        var collection = db.collection('xeRate');
       // var collection = db.collection('cRateCount');
			collection.find({}).toArray(function(err, result){
				if (err){
					console.log(err);
				} else if (result.length){
					console.log(result);
					
				} else {
					console.log('No documents found');
				}	
				db.close();  
				//collection.drop();	
				MongoClient.disconnect;
			    flag = true;				
			});	
			
         
	}
  });
  return flag ;
};




