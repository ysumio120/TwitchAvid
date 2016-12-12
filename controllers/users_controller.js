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

module.exports = router;