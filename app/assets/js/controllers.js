var SousVideControllers = angular.module('SousVideControllers', []);

SousVideControllers.controller('indexController', function($scope) {
	$scope.current = 0;
	$scope.target = 0;
	$scope.error = $scope.current - $scope.target
	if (Math.abs($scope.error) <= 0.1) {
		$scope.currentColor = "success";
	} else if (Math.abs($scope.error) <= 1.0) {
		$scope.currentColor = "warning";
	} else {
		$scope.currentColor = "danger";
	}

	$scope.userMeat = new Object();
	$scope.userColor = new Object();
	$scope.userTemp = 50;

	$scope.meats = [
		{
			type: "Beef",
			colors: [
				{
					color: "Blue",
					min: 20,
					max: 30
				}
			]
		}
	];

	/*$scope.meats = ["Beef", "Pork", "Chicken"];
	
	$scope.colors = [
		{
			level: "Blue",
			meat: "Beef"
		},
		{
			level: "Rare",
			meat: "Beef"
		},
		{
			level: "Medium-Rare",
			meat: "Beef"
		},
		{
			level: "Medium",
			meat: "Beef"
		},
		{
			level: "Medium-Well",
			meat: "Beef"
		},
		{
			level: "Well Done",
			meat: "Beef"
		}
	];

	$scope.temps = [
		{
			min: 46, 
			max: 49,
			meat: "Beef",
			color: "Blue"
		},
		{
			min: 52,
			max: 55,
			meat: "Beef",
			color: "Rare"
		}
	];*/
});