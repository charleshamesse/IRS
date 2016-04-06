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
  this.launch = function(cmd) {
    var cmd  = cp.exec('Rscript ../work/explore.R '
    + '--parameter-file "../../irs-generated/parameters.txt" '
    + '--sel-param-file ../../irs-generated/selection.txt '
    + '--candidates-file ../../irs-generated/candidates.txt '
    + '--instance-file ../work/instances.txt '
    + '--hook-run ../work/hook-run-rand '
    + '--parallel 1 --type full '
    + '--log-file ../work/test.txt');
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
