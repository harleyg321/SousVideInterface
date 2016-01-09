var SousVideControllers = angular.module('SousVideControllers', []);

SousVideControllers.controller('indexController', function($scope) {
	$scope.current = 0;
	$scope.target = 0;
	$scope.error = $scope.current - $scope.target;

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

	$scope.$watch('userColor', function(newValue, oldValue) {
		// on initial page load newValue is undefined, so set to existing value
		$scope.userTemp = Math.round((newValue.min + newValue.max)/2) || $scope.userTemp;
	});
	
});