var SousVideControllers = angular.module('SousVideControllers', []);

SousVideControllers.controller('indexController', function($scope, $window) {
	$scope.current = 0;
	$scope.target = 0;
	$scope.error = 0;
	$scope.variance = 0;
	$scope.multiple = false;
	$scope.currentColor = "success";


	$scope.userMeat = new Object();
	$scope.userColor = new Object();
	$scope.userTemp = 50;

	$scope.meats = [
		{
			type: "Beef",
			colors: [
				{
					color: "Blue",
					min: 45,
					max: 50
				},
				{
					color: "Rare",
					min: 50,
					max: 55
				},
				{
					color: "Medium rare",
					min: 55,
					max: 60
				},
				{
					color: "Medium",
					min: 60,
					max: 65
				},
				{
					color: "Medium well",
					min: 65,
					max: 70
				},
				{
					color: "Well done",
					min: 70,
					max: 75
				}
			]
		}
	];

	$scope.userColorChange = function() {
		$scope.userTemp = Math.round(($scope.userColor.min + $scope.userColor.max)/2);
	};

	var socket = io();

	socket.on('temperature', function(data) {
		$scope.$apply(function() {
			var temp_str = data.split(",");
			var temp = 0;

			temp_str.forEach(function(entry) {
				temp += +entry;
			});
			temp /= temp_str.length;

			$scope.current = temp;
			$scope.variance = Math.abs(Math.max.apply(Math, temp_str) - Math.min.apply(Math, temp_str));
			$scope.multiple = temp_str.length > 1;
			$scope.error = $scope.current - $scope.target;

			if (Math.abs($scope.error) <= 0.1) {
				$scope.currentColor = "success";
			} else if (Math.abs($scope.error) <= 1.0) {
				$scope.currentColor = "warning";
			} else {
				$scope.currentColor = "danger";
			}
		});
	});

	var w = $window.innerWidth,
		h = $window.innerHeight,
		margin = {top: 10, right: 0, bottom: 100, left: 0},
	    margin2 = {top: h-90, right: 0, bottom: 0, left: 0},
	    width = w - margin.left - margin.right,
	    height = h - margin.top - margin.bottom,
	    height2 = h - margin2.top - margin2.bottom;

	var chartdata;

	var x = d3.scale.linear().range([0, width]),
	    x2 = d3.scale.linear().range([0, width]),
	    y = d3.scale.linear().range([height, 0]),
	    y2 = d3.scale.linear().range([height2, 0]);

	var brush = d3.svg.brush()
	    .x(x2)
	    .on("brush", brushed);

	var current1 = d3.svg.line()
	    .interpolate("monotone")
	    .x(function(d) { return x(d.i); })
	    .y(function(d) { return y(d.current); });

	var current2 = d3.svg.line()
	    .interpolate("monotone")
	    .x(function(d) { return x2(d.i); })
	    .y(function(d) { return y2(d.current); });

	var target1 = d3.svg.line()
	    .interpolate("monotone")
	    .x(function(d) { return x(d.i); })
	    .y(function(d) { return y(d.target); });

	var target2 = d3.svg.line()
	    .interpolate("monotone")
	    .x(function(d) { return x2(d.i); })
	    .y(function(d) { return y2(d.target); });

	var svg = d3.select("#chart")
		.append("svg")
		.attr("preserveAspectRatio", "none")
		.attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom));

	svg.append("defs").append("clipPath")
	    .attr("id", "clip")
	  .append("rect")
	    .attr("width", width)
	    .attr("height", height);

	var focus = svg.append("g")
	    .attr("class", "focus")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var context = svg.append("g")
	    .attr("class", "context")
	    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

	d3.csv("/assets/data.csv", type, function(error, data) {
	  x.domain(d3.extent(data.map(function(d) { return d.i; })));
	  y.domain([d3.min(data.map(function(d) { return Math.min(d.current, d.target); })),
	  			d3.max(data.map(function(d) { return Math.max(d.current, d.target); }))]);
	  x2.domain(x.domain());
	  y2.domain(y.domain());

	  chartdata = data;

	  focus.append("path")
	      .datum(data)
	      .attr("class", "current-line")
	      .attr("d", current1);

	  context.append("path")
	      .datum(data)
	      .attr("class", "current-line")
	      .attr("d", current2);

	  focus.append("path")
	      .datum(data)
	      .attr("class", "target-line")
	      .attr("d", target1);

	  context.append("path")
	      .datum(data)
	      .attr("class", "target-line")
	      .attr("d", target2);

	  context.append("g")
	      .attr("class", "x brush")
	      .call(brush)
	    .selectAll("rect")
	      .attr("y", -6)
	      .attr("height", height2 + 7);
	});

	function brushed() {
	  x.domain(brush.empty() ? x2.domain() : brush.extent());
	  var dataFiltered = chartdata.filter(function(d, i) {
	      if ( (d.i >= (x.domain()[0])-1) && (d.i <= (x.domain()[1])+1) ) {
	        return d;
	      }
      });
      y.domain([d3.min(dataFiltered.map(function(d) { return Math.min(d.current,d.target); })),
      			d3.max(dataFiltered.map(function(d) { return Math.max(d.current,d.target); }))]);
	  focus.select(".current-line").attr("d", current1);
	  focus.select(".target-line").attr("d", target1);
	}

	function type(d) {
	  d.i = +d.i;
	  d.current = +d.current;
	  return d;
	}
	
});