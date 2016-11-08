var express = require('express');
var path = require('path');

var app = express();

var port = process.env.PORT || 8080;
// var port = 8080;

// app.use('/assets', express.static(path.join(__dirname, '/css')));
// app.use('/assets', express.static(path.join(__dirname, '/images')));
// app.use('/assets', express.static(path.join(__dirname, '/js')));

app.use(express.static(path.join(__dirname, '/assets')));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port);