var express = require("express");
var mongoose = require("mongoose");
var Users = require("../models/users");

var router = express.Router();

router.get("/", function(req, res) {
	Users.find(function(err, users) {
		if(err) throw err;
		res.json(users);
	});
})

router.get("/:username", function (req, res) {
	Users.findOne({username: req.params.username}, function(err, user) {
		if(err) throw err;
		res.json(user);
	})
})

router.post("/signup", function(req, res) {
	var username = req.body.username;
	var email = req.body.email;
	Users.create({username: username, email: email}, function(err, user) {
		res.json(user);
	})
})

router.get("/save", function(req, res) {

})

router.post("/save", function(req, res) {
	var id = req.body.id;

	// Parse JSON Object
	var tabs = JSON.parse(req.body.tabs); 
	for(var i = 0; i < tabs.length; i++) {
		var streamers = tabs[i].streamers; 
		console.log(streamers);
		for(var j = 0; j < streamers.length; j++) {
			tabs[i].streamers[j] = JSON.parse(streamers[j]);
		}
	}

	Users.findByIdAndUpdate(id, {$set: {tabs: tabs}}, function(err, user) {
		if(err) throw err;
		res.sendStatus(200);
	})
})

module.exports = router;