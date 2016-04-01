angular.module('app')
.controller('IndexController', function($scope, FileExplorer, FileManager) {

  $scope.FileExplorer = FileExplorer;
  $scope.FileManager = FileManager;

});
