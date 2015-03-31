var express = require('express');
var session = require('express-session');
var http = require('http');
var Datastore = require('nedb');
var genuuid = require('gen-uid');
var bodyParser = require('body-parser');
NedbStore = require('connect-nedb-session')(session);

var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(session({
	genid: function(req) {
		return genuuid.v4(); // use UUIDs for session IDs
	},
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
	name: 'cookie_name',
	store: new NedbStore({ filename: 'sess' })
}))

var db = new Datastore();
