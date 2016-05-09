'use strict';

angular.module('app')
.service('FileParser', function () {

  // Globals
  var fs = require('fs');

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
        console.log(line);
        params.push(p);
      }
    });
    return params;
  };

  


});
