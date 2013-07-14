YUI().use('node', 'io-base', 'json-parse', function (Y) {
    // IO Utility is available and ready for use. Add implementation
    // code here.

    console.log(profileData);

    if (profileData) {
        function complete(id, o, args) {
	        var id = id; // Transaction ID.
	        if (o.responseText) {
	        	var data = Y.JSON.parse(o.responseText);

	        	var container = Y.one('#loading');

	        	var imageUrl, updateText, name, username;
	        	var items = '';
	        	if (data.length < 1) {
	        		name = 'Forever Alone';
	        		username = 'octocat';
	        		imageUrl = '/images/foreveralone.png';
	        		updateText = '<p>Sorry! You are not that active on Github, please try elsewhere!</p>';
	        	}
	        	else {
	        		var profile = data[0];
	        		name = profile.name;
	        		username = profile.username;
	        		imageUrl = 'http://www.gravatar.com/avatar/' + profile.gravatar_id + '?s=200';
	        		updateText  = '<p>Your perfect match is <a href="https://github.com/' + profile.userId + '"><em>' + profile.name + '</em></a>!!</p>';
	        		updateText += '<cite>(You have been matched according to your favorite languages, location, gender, github activity, popularity in github)</cite>';
	        	
	        	}

	        	items += '<div class="match">';
	        	items += '	<a href="https://github.com/' + username + '" title="' + name + '">';
	        	items += '		<img src="' + imageUrl + '" alt="' + name + ' title="' + name + '">';
	        	items += '	</a>';
	        	items += '</div>';
	        	
	        	container.setContent('<div class="matches pure-u-1">' + items + '</div>');

	        	var result = Y.one('div.result');

	        	result.setContent(updateText);
	        }

	    };
	
	    Y.on('io:complete', complete);
	    profileData.location = profileData.location.split(',')[0].trim();

	    var gender = (profileData.gender) ? profileData.gender : 'male';
	    gender = (gender == 'male') ? 'female' : 'male';
	    var uri = '/match?location=' + profileData.location + '&language=' + profileData.language + '&gender=' + gender;
	
		var request = Y.io(uri);
   	}


});