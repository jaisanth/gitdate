var client_id = '<<<<<<< >>>>>>>>';
var client_secret = '<<<<<<< >>>>>>>>';
var querystring = require('querystring');
var nosql = require('nosql').load('database.nosql');
var localRequest = require('request');

exports.index = function(req, res){
    res.redirect("https://github.com/login/oauth/authorize?client_id=" + client_id);
};

exports.callback = function(req, res){

    var getLoggedInUser = function(access_token, response) {

        console.log(access_token);
        var postData={
            'access_token' : access_token
        };



        localRequest.get({
            uri:"https://api.github.com/user?access_token=" + access_token,
            headers:{'content-type': 'application/x-www-form-urlencoded'},
            body:require('querystring').stringify(postData)
        },function(err,response,body){
            console.log(body);
            console.log(response.statusCode);
            var jsonData = JSON.parse(body);
            console.log(jsonData);
            nosql.insert({id: jsonData["login"], token: access_token}, function(){});


            var userQuery = require('../repos.js');
            userQuery.gitUserDetails(jsonData["login"], function(user) {
                var userData = JSON.parse(user);
                if (userData.status) {
                    res.render('home', userData);
                }
                else {
                    res.redirect('/');
                }
            });
        });
    };

    var getAccessToken = function(body) {
        var tokens = body.split("&");
        var access_token_map = tokens[0].split("=");
        var access_token = access_token_map[1];
        return access_token;
    };

    var postData={
        'code' : req.query.code,
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
        getLoggedInUser(access_token, res);
        
    });
};



exports.match = function(req, res) {
    var searchUser = require('../search.js');

    var location = req.query.location,
        language = req.query.language,
        gender = req.query.gender;

    var matchedUsers = searchUser.searchCached(location, language, gender);
    console.log('matched users = ' + matchedUsers);
 
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(matchedUsers));
};




