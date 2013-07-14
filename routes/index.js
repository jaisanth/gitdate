
/*
 * GET home page.
 */

exports.index = function(req, res){
	
	var get_user = function() {
		var user = req.params.id;
		return (user) ? true : false;
 	}

	var loggedIn = get_user();

	if (loggedIn) {
		res.render('index', { title: '$ git date', login: false });
	}
	else {
		res.render('index', { title: '$ git date', login: true });
	}

};