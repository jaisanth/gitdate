/*

Software Copyright License Agreement (BSD License)

Copyright (c) 2010, Yahoo! Inc.
All rights reserved.

*/

var YQL = require('yql');
var nosql = require('nosql').load('database.nosql');

var userCache = {};

function gitUserDetails(userId, callback) {
    console.log(userId);
    if (userCache[userId] != undefined) {
        callback(userCache[userId]);
        return;
    }

    var user = {"done" : false};
    var postData={
        
    };

   var access_token;
    nosql.one('userId',function(data) {
        access_token = data;
    });



    require('request').get({
    uri:"https://api.github.com/legacy/user/search/" + userId + '?access_token=' + access_token,
    headers:{'content-type': 'application/x-www-form-urlencoded'},
    body:require('querystring').stringify(postData)
    },function(err,res,body){
        
        if (res.code != 200)

        console.log(res.statusCode + " for " + userId);
        var responseObj = JSON.parse(body).users;
        console.log(responseObj);

        if (responseObj instanceof Array) {
            responseObj = responseObj[0];
        }        
        
        user = {
                    "status" : true,
                    "name" : responseObj.fullname,
                    "location" : responseObj.location,
                    "gravatar_id" : responseObj.gravatar_id,
                    "language" : responseObj.language,
                    "score" : responseObj.score,
                    "done" : false,
                    userId : userId
                };

                //console.log(user);
                getGravatarDetails(user.gravatar_id, user, callback);               
        
    });

    return user;
};

function getGravatarDetails(gravatarId, user, callback) {
    //console.log(user.userId);
    new YQL.exec("USE \"store://hLv5Oupe5xVzCfrDqholY6\" as rekognition.face; SELECT * from rekognition.face WHERE (image_url=@image_url) and (api_key=@api_key) and (api_secret=@api_secret)", function(response) {
        if (response.error) {
            user.gender = "male";
            user.confidence = 1;
            user.smile = 1;        
        }
        else if (response.query.results && response.query.results.json.face_detection) {
            var imageDetails = response.query.results.json;
            user.gender = (imageDetails.face_detection.sex > 0.5) ? "male" : "female";
            user.confidence = imageDetails.face_detection.confidence;
            user.smile = imageDetails.face_detection.smile;
            user.image_url = imageDetails.url;
            user.sex = imageDetails.face_detection.sex;
        }
        else {
            var imageDetails = response.query.results.json;
            user.gender = "male";
            user.confidence = 1;
            user.smile = 1;
            user.image_url = imageDetails.url;
        }
 
        getFollowerUsers(user.userId, user, callback);
                
        
    }, {
        "api_key": "<<<< API_KEY >>>>",
        "api_secret": "<<<<< API SECRET >>>>",
        "image_url": "http://www.gravatar.com/avatar/" + gravatarId + "?s=200"
    });
};

function getFollowerUsers(userId, user, callback) {
    new YQL.exec("select * from github.user.followers where id=@userId", function(response) {

        user.followers = [];
        if (response.query.results) {
                var responseObj = response.query.results.json.json;
                 
                for (var key in responseObj) {
                    var follower = responseObj[key];
                    user.followers.push(follower.login);
                }
            }
        getFollowingUsers(userId, user, callback);    
    }, {"userId":userId});
}

function getFollowingUsers(userId, user, callback) {
    new YQL.exec("select * from github.user.following where id=@userId", function(response) {

        user.following = [];
        if (response.query.results) {
                var responseObj = response.query.results.json.json;
                 
                for (var key in responseObj) {
                    var follower = responseObj[key];
                    user.following.push(follower.login);
                }
            }
         user["done"] = true;
         userCache[userId] = JSON.stringify(user);
         callback(JSON.stringify(user));   
         //console.log(user);    
    }, {"userId":userId});
}


function getRecentEventsForUser(userId) {

}

/*var user = gitUserDetails('paulirish', callback);
console.log(user);
function callback(result) {
    console.log(result);
}*/

exports.gitUserDetails = gitUserDetails;

//function get

