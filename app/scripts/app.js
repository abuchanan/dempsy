'use strict';

var mod = angular.module('dempsy', [
  'ngRoute'
]);


mod.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});


mod.controller('MainCtrl', function ($scope) {
});
