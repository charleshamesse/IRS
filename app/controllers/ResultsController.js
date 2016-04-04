angular.module('app')
.controller('ResultsController', function($scope, ResultParser) {
  // Globals
  $scope.Results = {};

  var stdout2 = `Initial 16663
localsearch=3,nnls=40,dlb=1 13390
alpha=1 5402
beta=2 12242
algorithm=mmas 12263
rho=0.2 3467
ants=25 13753`;
var stdout = `algorithm=mmas 19625.6666666667
algorithm=eas,elitistants=494.89 22351.3333333333
algorithm=ras,rasrank=81.97 25077.3333333333
algorithm=acs,q0=0.52 27803
localsearch=1,nnls=16.81,dlb=1 30529
localsearch=2,nnls=46.25,dlb=1 11409.3333333333
localsearch=3,nnls=44.78,dlb=0 3212.66666666667
alpha=0.05 5938.33333333333
alpha=1.07 8664.33333333333
alpha=1.67 11390.3333333333
alpha=2.92 14116
alpha=4.02 16841.6666666667
beta=1.34 19567.6666666667
beta=2.67 22293.3333333333
beta=4.93 25019.3333333333
beta=5.83 27745.3333333333
beta=7.63 30471
rho=0.03 16964.3333333333
rho=0.29 19993
rho=0.35 22718.6666666667
rho=0.56 25444.6666666667
rho=0.71 28170.3333333333
ants=11.46 30896.3333333333
ants=25.98 11777
ants=39.49 3580
ants=60.53 6305.66666666667
ants=78.19 9031.66666666667`;

  // Display output
  $scope.Results.parse = ResultParser.parseFullExploration(stdout);

  $scope.d3Data = $scope.Results.parse.plotData;
  $scope.d3Data2 =  [{
    "sale": "2",
    "year": "2000"
  }, {
    "sale": "115",
    "year": "2002"
  }, {
    "sale": "79",
    "year": "2004"
  }, {
    "sale": "19",
    "year": "2006"
  }, {
    "sale": "54",
    "year": "2008"
  }, {
    "sale": "176",
    "year": "2010"
  }];

});
