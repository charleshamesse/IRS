angular.module('app')
.controller('ResultsMultipleController', function($scope, ResultParser, FileWriter) {
  // Globals
  $scope.ResultsMultiple = {
    "file": $scope.file
  };
  require('svgtopng');
});
