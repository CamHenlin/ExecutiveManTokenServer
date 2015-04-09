var express = require('express');
var session = require('express-session');
var http = require('http');
var Datastore = require('nedb');
var genuuid = require('gen-uid');
var http = require('follow-redirects').http;
var bodyParser = require('body-parser');
NedbStore = require('connect-nedb-session')(session);

var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json())
app.use(
	session({
		genid: function(req) {
			return genuuid.v4(); // use UUIDs for session IDs
		},
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true,
		name: 'cookie_name',
		store: new NedbStore({ filename: 'sess' })
	})
);

var collection = new Datastore({ filename: 'nedb', autoload: true });

function log(text) {
	collection.insert(text, function() {
		console.log(text);
	});
}

/**
 * [static route, used to display game content]
 */
app.use('/', express.static(__dirname + '/bm/'));

/**
 * [verifyToken route. handles verifying tokens and invalidating them after verification]
 */
app.get('/verifyToken/:token', function(req, res) {
	// req.params.token
	var http = require('follow-redirects').http;

	var options = {
		host: "128.223.6.212",
		port: "8247",
		path: "fitbitcontroller/validateGameToken?token=" + req.params.token
	};

	var callback = function(response) {
		var documentText = ''
		response.on('data', function (chunk) {
			documentText += chunk;
		});

		response.on('end', function () {
			if (response.statusCode === 200) {
				log('token ' + req.params.token + ' is valid.');
				log(documentText);
				invalidateToken(req.params.token);
				res.end(200);
			} else {
				log('token ' + req.params.token + ' is invalid.');
				log(documentText);
				res.end(402);
			}

			documentText; // has complete text of request doc
		});
	};

	var request = http.request(options, callback);

	request.on('error', function (error) {
		log('unexpected error occurred while attempting to validate ' + req.params.token);
		res.end(402);
	});

	request.end();
});

/**
 * [invalidateToken handles invalating a token]
 * @param  {[type]} token [token string to invalidate]
 * @return {[type]}       [void]
 */
function invalidateToken(token) {
	var options = {
		host: "128.223.6.212",
		port: "8247",
		path: "fitbitcontroller/invalidateGameToken?token=" + req.params.token
	};

	var callback = function(response) {
		var documentText = ''
		response.on('data', function (chunk) {
			documentText += chunk;
		});

		response.on('end', function () {
			if (response.statusCode === 200) {
				log('invalidated ' + token);
			} else {
				log('unable to invalidate ' + token);
				log(documentText);
			}

			documentText; // has complete text of request doc
		});
	};

	var request = http.request(options, callback);

	request.on('error', function (error) {
		log('unexpected error occurred while attempting to validate ' + token);
	});

	request.end();
}