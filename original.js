require('jade');
var express = require("express"); 
var YQL = require("yql");
var app = express();
var querystring = require('querystring');
var https = require('https');
var nosql = require('nosql').load('database.nosql');
https.globalAgent.options.secureProtocol = 'TLSv1_method';
var client_id = '<<<<<< >>>>>>';
var client_secret = '<<<<<<<<< >>>>>>>>';


app.use(express.logger()); 
app.get('/', function(request, response) {

    var users = [];
    var callback = function(selected) {

    if (selected != undefined && selected != null) {

    selected.forEach(function(o) {
        users.push(o.id + ' ' + o.token);
    });
    }

    // how to sort?
    // use Array.sort() function

    console.log('Users between 25 and 35 years old: ' + users.join(', '));
    response.send('Currently logged in users are: \n' + users.join(', ')); 
    }

    var filter = function(doc) {
        return true;
    };

    nosql.insert({ firstName: 'Fero', lastName: 'Samo', age: 40 });
    nosql.all(filter, callback);
	
});

app.get('/home', function(request, response) { 
    response.render('index.jade', {
    title: 'Home'
  });
 
});

app.get('/login', function(request, response) {
	response.redirect("https://github.com/login/oauth/authorize?client_id=" + client_id);
});

app.get('/callback', function(request, response) {

	var postData={
		'code' : request.query.code,
      'client_secret': client_secret,
      'client_id': client_id
	};
require('request').post({
    uri:"https://github.com/login/oauth/access_token",
    headers:{'content-type': 'application/x-www-form-urlencoded'},
    body:require('querystring').stringify(postData)
    },function(err,res,body){
        console.log(body);
        console.log(res.statusCode);
        var access_token = getAccessToken(body);
        getLoggedInUser(access_token, response);
        
	});

});

function getLoggedInUser(access_token, response) {

	console.log(access_token);
	var postData={
		'access_token' : access_token
	};

	require('request').get({
    uri:"https://api.github.com/user?access_token=" + access_token,
    headers:{'content-type': 'application/x-www-form-urlencoded'},
    body:require('querystring').stringify(postData)
    },function(err,res,body){
        console.log(body);
        console.log(res.statusCode);
        var jsonData = JSON.parse(body);
        nosql.insert({id: jsonData["login"], token: access_token}, function(){});
        response.render('index.jade', {
            title: body
        });
        
	});
}

function getAccessToken(body) {
	var tokens = body.split("&");
	var access_token_map = tokens[0].split("=");
	var access_token = access_token_map[1];
	return access_token;
}

var port = process.env.PORT || 5000; 
app.listen(port, function() { 
	console.log("Listening on " + port); 
});
