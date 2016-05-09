'use strict';

angular.module('app')
.service('FileParser', function () {

  // Globals
  var fs = require('fs');
  var remote = require('remote');
  var dialog = remote.require('dialog');

  // Parameters
  this.parseParameterFile = function(filename) {
    var params = [];
    var data = fs.readFileSync(filename, 'utf8');
    if(!data) {
      throw err;
      console.log(err);
      return 0;
    }
    var lines = data.trim().split('\n');
    lines.forEach(function(l) {
      if(l[0] != '#' && l != "") {
        var p = {},
        line = l.substring(0, l.indexOf('"'));
        p.name = line.trim();
        var line2 = l.substring(l.indexOf('"')+1);
        p.switch = line2.substring(0, line2.indexOf('"'));
        var line3 = line2.substring(line2.indexOf('"')+1).trim();
        p.type = line3[0];
        p.values = line3.slice(1).substring(0, line3.indexOf(")")).trim();
        var line4 = line3.slice(line3.indexOf(")")+1).trim();
        p.conditions = line4.slice(line4.indexOf("|")+2);
        params.push(p);
      }
    });
    return params;
  };

  // Parameter selection
  this.parseParameterSelectionFile = function(path) {
    var data = fs.readFileSync(path, 'utf8'),
        params = [];
    if(!data) {
      throw err;
      console.log(err);
      return 0;
    }
    var lines = data.trim().split('\n');
    angular.forEach(lines, function(l) {
      if(l[0] != '#') {
        params.push(l);
      }
    });
    return params;
  }

  // Candidates
  this.parseCandidateFile = function(path) {
    var data = fs.readFileSync(path, 'utf8');
    if (!data) dialog.showMessageBox('Error', 'Unable to open file: ' + path);

    // Parse candidate file
    var lines = data.trim().split('\n'),
    count = 0,
    parameters = [],
    candidates = [],
    values = [];

    lines.forEach(function(l) {
      if(l[0] != '#' && l != "") {
        // Parameter list
        if(count == 0) {
          parameters = l.match(/\S+/g);
          ++count;
        }
        else {
          candidates.push({
            'label': "Candidate " + count,
            'values': l.match(/\S+/g),
            'develop': false,
            'info': 'Source: "' + path + '".',
            'lock': true
          });
          ++count;
        }
      }
    });
    return [parameters, candidates];
  };


});
