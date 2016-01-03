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
	
});