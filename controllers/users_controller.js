var express = require("express");
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Users = require("../models/users");

var router = express.Router();

router.get("/", function(req, res) {
	Users.find(function(err, users) {
		if(err) throw err;
		res.json(users);
	});
})

router.post("/signup", function(req, res) {
	var username = 4;
	var password = req.body.password;
	bcrypt.genSalt(10, function(err, salt) {
		if(err) throw err;

	    bcrypt.hash(password, salt, function(err, hash) {
	        if(err) throw err;

	        var hashedPassword = hash;
	        Users.create({name: username, password: hashedPassword}, function(err, instance) {
	        	console.log(instance);
	        });
	    });
	});
})

module.exports = router;