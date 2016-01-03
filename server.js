var express = require('express');
var app = express();

app.use(express.static(__dirname + '/app'));
app.use(function(req, res) {
	res.sendFile(__dirname + "/app/index.html");
});

app.listen(process.env.PORT || 80);