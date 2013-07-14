
/*

Software Copyright License Agreement (BSD License)

Copyright (c) 2010, Yahoo! Inc.
All rights reserved.

*/

var fs = require('fs');
var YQL = require('yql');
var nosql = require('nosql').load('database.nosql');
var UserDetails = require('./repos.js');

var searchCache = {};

var citiIndex = {};
var languageIndex = {};

function loadCache(fileName) {
    fs.readFile(fileName,{encoding:'utf8'}, function (err, data) {
        console.log(fileName);
        var recs = data.trim().split('\n');

        for (var i in recs) {
            if (recs[i] != undefined) {
                var obj = JSON.parse(recs[i]);
                var str = "";
                for (k in obj) {
                    str = str + obj[k];
                }
                obj = JSON.parse(str);
                if (obj["location"] == null || obj["language"] == null) {
                    continue;
                }
                var location = obj["location"].trim().toLowerCase().split(",")[0];
                var language = obj["language"].trim().toLowerCase();
                if (citiIndex[location] == undefined) {
                    citiIndex[location] = [];
                }
                citiIndex[location].push(obj);
                if (languageIndex[location] == undefined) {
                    languageIndex[language] = [];
                }
                languageIndex[language].push(obj);
            }
        }   

        console.log(recs.length);
    });
}


function searchGithub(location, language, callback) {
    //console.log(searchCache);
    if (searchCache[location + "." + language] != undefined) {
        callback(searchCache[location + "." + language]);
        return;
    }

    var access_token;
    nosql.one('userId',function(data) {
        access_token = data;
    });

    var results = {"done" : false};
    var users = [];


    var postData={
        
    };

    var url = "https://api.github.com/legacy/user/search/" + "language:" + language + " " + "location:" + location + '?access_token=' + access_token;
    console.log(url);

    require('request').get({
    uri:url,
    headers:{'content-type': 'application/x-www-form-urlencoded'},
    body:require('querystring').stringify(postData)
    },function(err,res,body){
        //console.log(body);
        //console.log(res.statusCode);
        var count = 0;
        var responseObj1 = JSON.parse(body);
        var responseObj = responseObj1.users;
        for (key in responseObj) {
            count++;
            if (count > 10) {
                break;
            }
            var user = responseObj[key];
            users.push(user);
        }
                
        callback(users);
    });
};


//searchGithub('san-francisco','javascript', callback);
function loadCaches() {
    loadCache('java_bangalore');
    loadCache('java_new_york');
    loadCache('java_san_francisco');
    loadCache('java_sunnyvale');
    loadCache('javascript_bangalore');
    loadCache('javascript_san_francisco');
    loadCache('php_bangalore');
}

function searchCached(location, language, gender) {
    
    var citiData = [];
    for (k in citiIndex) {
        
        if (k.indexOf(location.toLowerCase()) != -1) {
            console.log(k + "-->" + location.toLowerCase());
            citiData = citiData.concat(citiIndex[k]);
        }
    }
    var output = [];
    for (var ix in citiData) {
        var obj = citiData[ix];
        //console.log(obj.language + "===" + language);
        if (obj.language != undefined && language!= undefined && language.length > 0 && obj.language.toLowerCase().indexOf(language.toLowerCase()) != -1) {
                output.push(obj);
        }
    }

    var finalOutput = [];

    for (var ix in output) {
        var obj = output[ix];
        if (obj.gender == gender) {
            finalOutput.push(obj);
        }
    }
    console.log('#################################');
    console.log(finalOutput);
    return (finalOutput);
}


function callback(result) {
    console.log(result);
    var count = 0;
    for (key in result) {
        var user = result[key];
        console.log(user);
        UserDetails.gitUserDetails(user.login, userDetailsCallback);
    }
}


function userDetailsCallback(user) {
    console.log(user);
    fs.appendFileSync("c#_bangalore",JSON.stringify(user) + '\n');
}

exports.searchGithub = searchGithub;
exports.searchCached = searchCached;
exports.loadCaches = loadCaches;

