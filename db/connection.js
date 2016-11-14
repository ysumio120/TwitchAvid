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

var predefined_models = require("./models/imports.js"); // Array of models
//console.log(pre_models);
for(var i = 0; i < predefined_models.length; i++) {
	models.push(predefined_models[i](sequelize, Sequelize));
	//.sync().then(function() {
	//	console.log("SYNCED");
		//Users.create({username: "test", password: "password"}).then(function(instance) {
		//	console.log("Match: " + Users.login("test", "password"));
		//});
		
};

sequelize.sync().then(function() {
	console.log("MODELS SYNCED");
});

module.exports = sequelize;