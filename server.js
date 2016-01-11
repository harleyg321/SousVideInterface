var express = require('express');
var serialport = require('serialport');
var io = require('socket.io');

var app = express();
var port = new serialport.SerialPort("/dev/ttyACM0", { baudrate: 115200, parser: serialport.parsers.readline("\n") });

app.use(express.static(__dirname + '/app'));
app.use(function(req, res) {
	res.sendFile(__dirname + "/app/index.html");
});
var webserver = app.listen(process.env.PORT || 80);

var socket = io(webserver);
socket.on("connection", function(websocket) {
	//console.log("A user connected");
});

port.on("data", function(data) {
	socket.emit('temperature', data);
});

