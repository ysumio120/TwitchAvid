var express = require('express');
var Sequelize = require("sequelize");
var bcrypt = require("bcryptjs");
var sequelize;

var models = [];

if(process.env.JAWSDB_URL) {
	sequelize = new Sequelize(process.env.JAWSDB_URL);
}
else {
	sequelize = new Sequelize("twitch_db", "root", "password", {
		host: "127.0.0.1",
  		port: 3306,
  		dialect: "mysql"
	});
}

var Users = require("./models/users.js")(sequelize, Sequelize);

models.push(Users);

for(var i = 0; i < models.length; i++) {
	models[i].sync().then(function() {
		console.log("SYNCED");
		//Users.create({username: "test", password: "password"}).then(function(instance) {
		//	console.log("Match: " + Users.login("test", "password"));
		//});
		
	});
}