var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/twitchavid", function(err) {
	if(err) throw err;
	console.log('connected');
});


// var MongoClient = require('mongodb').MongoClient;
// // Connection url
// var url = 'mongodb://localhost:27017/';
// // Connect using MongoClient

// var twitchavid_db;

// MongoClient.connect(url, function(err, db) {
  
//   twitchavid = db.db("twitchavid");
//   twitchavid.createCollection("users", {autoIndexId: true}, function() {
//   	console.log("CREATED STUFF");
//   });

//   // Use the admin database for the operation
//   var adminDb = db.admin();
//   // List all the available databases
//   adminDb.listDatabases(function(err, dbs) {
//     console.log(dbs);
//   });
// });


// var express = require('express');
// var Sequelize = require("sequelize");
// var bcrypt = require("bcryptjs");
// var sequelize;

// var models = [];

// if(process.env.JAWSDB_URL) {
// 	sequelize = new Sequelize(process.env.JAWSDB_URL);
// }
// else {
// 	sequelize = new Sequelize("twitch_db", "root", "password", {
// 		host: "127.0.0.1",
//   		port: 3306,
//   		dialect: "mysql"
// 	});
// }

// var predefined_models = require("./models/imports.js"); // Array of models
// //console.log(pre_models);
// for(var i = 0; i < predefined_models.length; i++) {
// 	models.push(predefined_models[i](sequelize, Sequelize));
// 	//.sync().then(function() {
// 	//	console.log("SYNCED");
// 		//Users.create({username: "test", password: "password"}).then(function(instance) {
// 		//	console.log("Match: " + Users.login("test", "password"));
// 		//});
		
// };

// sequelize.sync().then(function() {
// 	console.log("MODELS SYNCED");
// });

// module.exports = sequelize;