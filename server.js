var express = require('express');
var serialport = require('serialport');
var io = require('socket.io');
var pid = require('./pid.js');
var querystring = require('querystring');
var http = require('http');

var PID = new pid();
PID.setOutputLimits(0, 5000);
PID.setTunings(1100, 20, 2250000); //1250,20,2m //1250,15,2.5m

var chartdata = [];
var target = 0;
var R1 = 10000;
var R2 = 10000;
var B = 3380;
var temps1 = [];
var temps2 = [];
var power = 0;
var powers = [];

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
	websocket.on("target", function(data) {
		target = data;
		PID.setTarget(target);
		PID.setAuto(true);
	});
});

port.on("data", function(data) {
	var message = data.split(" ");
	if (message[0] == "T") {
		var temp_str = message[1].split(",");
		if (!isNaN(temp_str[0]) && temp_str[0] < 4095) temps1.push(temp_str[0]);
		if (!isNaN(temp_str[1]) && temp_str[1] < 4095) temps2.push(temp_str[1]);

		setTimeout(function() {
			if(temps1.length > 750 || temps2.length > 750) {
				temp1 = 0;
				temps1.forEach(function(entry) {
					temp1 += +entry;
				});
				temp1 /= temps1.length;

				temp2 = 0;
				temps2.forEach(function(entry) {
					temp2 += +entry;
				});
				temp2 /= temps2.length;

				temps1.length = 0;
				temps2.length = 0;

				var resistance1 = R2 * (4095 / temp1 - 1);
				var resistance2 = R2 * (4095 / temp2 - 1);
				var temperature1 = Math.log(resistance1 / R1);
				var temperature2 = Math.log(resistance2 / R1);
				temperature1 /= B;
				temperature2 /= B;
				temperature1 += 1 / (273.15 + 25);
				temperature2 += 1 / (273.15 + 25);
				temperature1 = 1 / temperature1;
				temperature2 = 1 / temperature2;
				temperature1 -= 273.15;
				temperature2 -= 273.15;

				var variance = Math.abs(temperature1 - temperature2);
				var temp = (temperature1 + temperature2)/2;
					
				//chartdata.push({i: chartdata.length, current: temp, target: target, variance: variance});
				//socket.emit('temperature', chartdata[chartdata.length-1]);
				
				var temp_post_data = "temperature,reading=current value=" + temp + "\ntemperature,reading=target value=" + target + "\ntemperature,reading=variance value=" + variance + "\ntemperature,reading=error value=" + Math.abs(temp-target);

				var temp_post_options = {
					host: 'localhost',
					port: 8086,
					path: '/write?db=SousVide',
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': Buffer.byteLength(temp_post_data)
					}
				};
				
				var temp_httpreq = http.request(temp_post_options, function(response) {
					response.setEncoding('utf8');
					response.on('data', function(chunk) {
						console.log("body: " + chunk);
					});
				});
				temp_httpreq.write(temp_post_data);
				temp_httpreq.end();

				powers.push(PID.compute(temp));

				if(powers.length >= 5) {
					power = 0;
					powers.forEach(function(entry) {
						power += entry;
					});
					power /= powers.length;
					powers.length = 0;
					port.write("O " + Math.round(power) + "\n");

					var power_post_data = "power value=" + Math.round(power) + "\npid,term=p value=" + Math.round(PID.getPterm()) + "\npid,term=i value=" + Math.round(PID.getIterm()) + "\npid,term=d value=" + Math.round(PID.getDterm());
               		                var power_post_options = {
                		            host: 'localhost',
            	            	            port: 8086,
                        	            path: '/write?db=SousVide',
                	                    method: 'POST',
           	                            headers: {
                       		            	'Content-Type': 'application/x-www-form-urlencoded',
                	                    	'Content-Length': Buffer.byteLength(power_post_data)
        	                            }
	                                };

					var power_httpreq = http.request(power_post_options, function(response) {
                                        	response.setEncoding('utf8');
                                        	response.on('data', function(chunk) {
                                                	console.log("body: " + chunk);
                                        	});
                                	});
                                	power_httpreq.write(power_post_data);
                                	power_httpreq.end();
				}
				console.log("Temp:" + ((temperature1+temperature2)/2).toFixed(2) + " P:" + Math.round(PID.getPterm()) + " I:" + Math.round(PID.getIterm()) + " D:" + Math.round(PID.getDterm()) + " Power:" + (power/5000*100).toFixed(2) + "%");
			}
		}, 0);
	}
});
