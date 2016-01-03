var SousVideApp = angular.module('SousVideApp', [
						'ngRoute',
						'SousVideControllers'
					]);
SousVideApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/index', {
			templateUrl: 'partials/index.html',
			controller: 'indexController'
		})
		.otherwise({
			redirectTo: '/index'
		});
}]);