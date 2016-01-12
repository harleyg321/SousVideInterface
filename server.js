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
	websocket.emit('history', chartdata);
});

var chartdata = [];
var target = 0;

port.on("data", function(data) {
	var temp_str = data.split(",");
	var temp = 0;

	temp_str.forEach(function(entry) {
		temp += +entry;
	});
	temp /= temp_str.length;
	var variance = Math.abs(Math.max.apply(Math, temp_str) - Math.min.apply(Math, temp_str));

	chartdata.push({i: chartdata.length, current: temp, target: target, variance: variance});
	socket.emit('temperature', chartdata[chartdata.length-1]);
});

