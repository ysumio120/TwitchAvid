var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/twitchavid", function(err) {
	if(err) throw err;
	console.log('database connected');
});
