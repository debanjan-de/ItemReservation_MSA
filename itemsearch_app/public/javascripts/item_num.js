var express = require('express'),
    app = express(),
    http = require('https'),
    //http = require('http'),
    bodyParser = require('body-parser');
var router = express.Router(), resp_data = [], result_data = '', cache_status = '';
app.use(bodyParser.raw());
router.use(function (request, response, next) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

/*****************************************
Logging framework initialization
*****************************************/
var logger = require('fluent-logger');
logger.configure('ibmms.itemsearch', {
  host: '168.1.140.231',
  port: 31224,
  timeout: 3.0,
  reconnectInterval: 600000 // 10 minutes
});


function find_item_api(res,itemNum,OrgCode){
	var uname = 'SCM IMPU1', pwd = 'Oracle123';
  var host_name="edrx-dev1.fa.us2.oraclecloud.com"; //"debanjande-eval-test.apigee.net";
	var item_str=(itemNum?"&q=ItemNumber=" + itemNum + "":null);
	console.log(new Date(Date.now()).toLocaleString()+":: "+"Item string = "+item_str);
	var options = {
	  //host: host_name,
    url: "https://edrx-dev1.fa.us2.oraclecloud.com/fscmRestApi/resources/11.13.18.05/itemsV2?fields=ItemId,ItemNumber,ItemDescription,OrganizationCode&onlyData=true&q=ItemNumber=IBM14",
	  //port: 80,
	  //path: "/fscmRestApi/resources/11.13.18.05/itemsV2?fields=ItemId,ItemNumber,ItemDescription,OrganizationCode&onlyData=true"+
	  //"OrganizationCode='" + OrgCode + "'" +
	  //item_str,
    headers: {
			'Authorization': 'Basic ' + new Buffer(uname + ':' + pwd).toString('base64')//,
			//'Content-Type': 'application/json',
			//'Accept': 'application/json'//,
			//'Content-Length': Buffer.byteLength(JSON.stringify(saveToBCReq))
		},
    //auth: uname + ":" + pwd, //"Basic " + new Buffer(uname + ":" + pwd).toString("base64"),
	  method: 'GET'
	};
	var request = require('request'), resp_raw = '';
	console.log(new Date(Date.now()).toLocaleString()+":: Request Header => "+JSON.stringify(options,0,4));
  request(options, function (error, response) {
    if (error) throw new Error(error);
    //console.log(response.body);
    console.log(new Date(Date.now()).toLocaleString()+":: "+"raw data: "+JSON.stringify(response,0,4));
    resp_data = JSON.parse(response.body).items; //JSON.parse(response);
    res.writeHead(200, {"Content-Type": "application/json"});
    var output = { data: resp_data };
    res.end(JSON.stringify(output) + "\n");
    return;
  });
	/*http.request(options, function(resp){
	  resp.on('data', function(chunk) {
		 resp_raw += chunk;
	  });
	  resp.on('end', function() {
  		console.log(new Date(Date.now()).toLocaleString()+":: "+"raw data: "+resp_raw);
  		resp_data = JSON.parse(resp_raw).items;
  		res.writeHead(200, {"Content-Type": "application/json"});
  		var output = { data: resp_data };
  		res.end(JSON.stringify(output) + "\n");
  		return;
	  });
	  resp.on('error', function(e) {
		  console.log(new Date(Date.now()).toLocaleString()+":: Got error => " + e.message);
		  res.writeHead(200, {"Content-Type": "application/json"});
		  var output = { error: "Failed in get On-hand details REST call", ItemNumber: itemNum };
		  res.end(JSON.stringify(output) + "\n");
		  return;
	  });
	}).end();*/
}

router.get('/find/:item_code', function(req, res) {
    logger.emit('ibmms.itemsearch.find_item', {source: 'ItemSearch', message: 'Finding item - '+req.params.item_code});
	//res.end("Sample output\n");
	find_item_api(res, req.params.item_code, req.params.orgcode);
});

module.exports = router;
