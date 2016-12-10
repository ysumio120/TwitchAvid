var bcrypt = require("bcryptjs");
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
	username: String,
	email: String,
	password: String,
	tabs: [{
		name: String,
		streams: [{
			streamname: String,
			chat: Boolean
		}]

	}]
});

var Users = mongoose.model("Users", userSchema);

module.exports = Users;


// module.exports = function(sequelize, DataTypes) {
// 	return sequelize.define("user", 
// 		{
// 			username: {
// 				type: DataTypes.STRING,
// 				allowNull: false
// 			},
// 			password: {
// 				type: DataTypes.STRING,
// 				allowNull: false
// 			}
// 		},
// 		{
// 			classMethods: {
// 				login: function(logInUsername, logInPassord) {
// 					this.findOne({where: {username: logInUsername}}).then(function(result) {
// 						console.log(result);
// 					 	if(result == null) return false;

// 					// 	var hashedPassword = result.password;

// 					// 	bcrypt.compare(logInPassord, hashedPassword, function(err, res) {
// 					// 		if(err) throw err;

// 					// 		//match = res;
// 					// 	});

// 					// })
// 					// //return match;
// 				})
// 				}
// 			},
// 			instanceMethods: {

// 			},
// 			hooks: {
// 				beforeCreate: function(user, options) {
// 					bcrypt.genSalt(10, function(err, salt) {
// 						if(err) throw err;

// 					    bcrypt.hash(user.password, salt, function(err, hash) {
// 					        if(err) throw err;

// 					        console.log("PasswordHashed: " + hash);
// 					  //       bcrypt.compare("password", hash, function(err, res) {
// 	    		// 				console.log("COMPARE---------------------------" + res);
// 							// });
// 					        user.update({password: hash}).then(function() {});
// 					    });
// 					});
// 				}
// 			}
// 		}	
// 	);	
// }