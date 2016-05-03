'use strict';

angular.module('app')
.service('Explorer', function () {

  // Globals and dependencies
  var fs = require('fs'),
      cp = require('child_process'),
      Explorer = {
        "terminalOutput": "",
        "exitCode": ""
      },
      observerCallback;

  // Register observer
  this.registerObserverCallback = function(callback){
    observerCallback = callback
  };

  // Notify observer
  var notifyObserver = function(){
    observerCallback();
  };
  // Launch
  this.launch = function(parameters) {
    console.log(parameters);
    Explorer.terminalOutput = "";
    var cmd  = cp.exec('Rscript ../work/explore.R '
    + '--parameter-file "' + parameters.parameterFile + '" '
    + '--sel-param-file "' + parameters.selectionFile + '" '
    + '--candidates-file "' + parameters.candidatesFile + '" '
    + '--instance-file "' + parameters.instanceFile + '" '
    + '--hook-run "' + parameters.hookRun + '" '
    + '--parallel 1 --type "' + parameters.type + '" '
    + '--log-file "' + parameters.logFile + '"');
    var counter = 0;
    cmd.stdout.on('data', function(data) {
      Explorer.terminalOutput += data;
      notifyObserver();
    });

    cmd.stderr.on('data', function(data) {
      Explorer.terminalOutput += data;
      notifyObserver();
    });

    cmd.on('exit', function(code) {
      Explorer.exitCode = code;
    });
  };

  this.output = function() {
    return Explorer.terminalOutput;
  }

  this.exitCode = function() {
    return Explorer.exitCode;
  }

});
