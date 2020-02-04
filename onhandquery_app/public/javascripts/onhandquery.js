var express = require('express'),
    app = express(),
    http = require('follow-redirects').http;
    //http = require('https'),
    //http = require('http'),
    bodyParser = require('body-parser');
var router = express.Router();
app.use(bodyParser.raw());
router.use(function (request, response, next) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

function find_onhand_direct(res,itemNum,OrgCode){
	var uname = 'SCM IMPU1', pwd = 'Oracle123';
  var host_name="edrx-dev1.scm.us2.oraclecloud.com";
	var item_str = (itemNum?"ItemNumber='" + itemNum + "';":null), org_code = (OrgCode?"OrganizationCode='"+OrgCode+"';":null);
	//console.log(item_str+OrgCode);
	var options = {
    method: 'GET',
    url: 'https://edrx-dev1.scm.us2.oraclecloud.com'+
    '/fscmRestApi/resources/11.13.18.05/onhandQuantityDetails?onlyData=true&q='+item_str+org_code+"SubinventoryCode='FG Store'",
    //'hostname': 'edrx-dev1.scm.us2.oraclecloud.com',
    //'path': '/fscmRestApi/resources/11.13.18.05/itemsV2?onlyData=true&q=ItemNumber%3DIBM14&fields=ItemId%2CItemNumber%2CItemDescription%2COrganizationCode',
    headers: {
      'Authorization': 'Basic ' + new Buffer(uname + ':' + pwd).toString('base64')
    },
    maxRedirects: 20
	  /*host: host_name,
	  port: 443,
	  path: "/fscmRestApi/resources/11.13.18.05/onhandQuantityDetails"+"?"+
	  "q=" + item_str + //'IBM1'
	  "OrganizationCode='" + OrgCode + //'IBMCM'
	  "';SubinventoryCode='" + "FG" +
	  "'&onlyData=true",
	  method: 'GET',
	  headers: {
		 'Authorization': 'Basic ' + new Buffer(uname + ':' + pwd).toString('base64')
   }*/
	};
	var request = require('request'), resp_raw = [];
	console.log(new Date(Date.now()).toLocaleString()+":: option from direct call - "+JSON.stringify(options,0,4));
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
	  resp.on("data", function(chunk) {
		 resp_raw += chunk;
	  });
	  resp.on("end", function() {
  		console.log(new Date(Date.now()).toLocaleString()+":: "+"raw data: "+resp_raw);
  		resp_data = JSON.parse(resp_raw).items;
  		res.writeHead(200, {"Content-Type": "application/json"});
  		var output = { data: resp_data };
  		res.end(JSON.stringify(output) + "\n");
  		return;
	  });
	  resp.on("error", function(e) {
		  console.log(new Date(Date.now()).toLocaleString()+":: "+"Got error: " + e.message);
		  res.writeHead(200, {"Content-Type": "application/json"});
		  var output = { error: "Failed in get On-hand details REST call" };
		  res.end(JSON.stringify(output) + "\n");
		  return;
	  });
	}).end();*/
}

function find_onhand_api(res,itemNum,OrgCode){
	//var uname = 'SCM IMPU', pwd = 'Oracle123';
  var host_name="debanjande-eval-test.apigee.net";
	var item_str=''; // = (itemNum?"ItemNumber='" + itemNum + "';":null);
	//console.log("Item string = "+item_str);
	var options = {
	  host: host_name,
	  port: 80,
	  path: "/v1/onhand/query/onhandQuantityDetails"+"?"+
	  "q=" + item_str + //'IBM1'
	  "OrganizationCode='" + OrgCode + //'IBMCM'
	  "';SubinventoryCode='" + "FG" +
	  "'&onlyData=true",
	  method: 'GET'
	};
	var request = require('request'), resp_raw = '';
	console.log(new Date(Date.now()).toLocaleString()+":: Header => "+JSON.stringify(options,0,4));
	http.request(options, function(resp){
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
		  console.log(new Date(Date.now()).toLocaleString()+":: "+"Got error: " + e.message);
		  res.writeHead(200, {"Content-Type": "application/json"});
		  var output = { error: "Failed in get On-hand details REST call" };
		  res.end(JSON.stringify(output) + "\n");
		  return;
	  });
	}).end();
}

router.get('/find/:org_code/:item_num', function (req, res) {
    //find_onhand_api(res, req.params.item_num, req.params.org_code);
    find_onhand_direct(res, req.params.item_num, req.params.org_code);
});

router.get('/find/:org_code', function (req, res) {
    //find_onhand_api(res, null, req.params.org_code);
    find_onhand_direct(res, null, req.params.org_code);
});

module.exports = router;
