var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var Sequelize = require("sequelize");
var bcrypt = require("bcryptjs");
var sequelize;
var application_controller = require("./controllers/application_controller");
var users_controller = require("./controllers/users_controller");

var app = express();

//console.log(sequelize);

var db_connection = require("./db/connection.js");

var port = process.env.PORT || 8080;
// var port = 8080;

// app.use('/assets', express.static(path.join(__dirname, '/css')));
// app.use('/assets', express.static(path.join(__dirname, '/images')));
// app.use('/assets', express.static(path.join(__dirname, '/js')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(express.static(path.join(__dirname, '/assets')));
app.use("/", application_controller)
app.use("/users", users_controller);

// app.get('/', function(req, res) {
// 	res.sendFile(path.join(__dirname + '/index.html'));
// });

// app.post('/login', function(req, res) {
// 	var user = req.body;
// 	console.log(user);
// 	var user_model = db_connection.model('user');
// 	user_model.login(user.username, user.password);
// 	//user.login("test1", "password");
// 	res.json("test");
// })
app.listen(port);