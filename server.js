var express = require('express');
var path = require('path');

var app = express();
var port = process.env.PORT;


app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + 'index.html'));
});

app.listen(port);