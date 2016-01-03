var SousVideApp = angular.module('SousVideApp', [
						'ngRoute',
						'SousVideControllers'
					]);

SousVideApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/index', {
			templateUrl: 'partials/index.html',
			controller: 'indexController'
		})
		.otherwise({
			redirectTo: '/index'
		});
	$locationProvider.html5Mode(true);
}]);