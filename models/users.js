var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
	username: {type: String, required: true},
	email: {type: String, required: true},
	tabs: Array
	}]
});

var Users = mongoose.model("Users", userSchema);

module.exports = Users;

/*
Tabs Array Structure
{
	[
		label: String,
		streamers: [ { name: String, display_name: String } ]
	]
}
*/
