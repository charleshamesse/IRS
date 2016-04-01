'use strict';

angular.module('app')
.factory('FileManager', function(){
  var FileManager = {};
  var fs = require('fs');
  var path = require("path");

  // List of open files
  FileManager.filesOpened = [];

  // View a file
  FileManager.activateFile = function(file) {
    FileManager.filesOpened.forEach(function(f) {
      f.active = false;
    });
    file.active = true;
  };

  // Open a file
  FileManager.openFile = function(file) {
    // If file is already open
    if(file.isOpened) {
      FileManager.activateFile(file);
    }

    // Check extension
    var ext = file.name.split(".").pop();

    // Open file
    var data = fs.readFileSync(file.path, 'utf8');
      var valid = false;
      try {
        file.content = JSON.parse(data);
        valid = true;
      } catch(e) {
        file.content = data;
        alert('No editor found for this file (' + e + '). Only text mode is enabled.');
      }

      file.isOpened = true;
      file.active = false;
      file.textonly = true;
      file.textmode = true;

      // Load editor if valid
      if(valid) {
        file.textonly = false;
        file.textmode = false;
        switch(file.content.type) {
          case "setup":
          file.editor = "templates/setup.html";
          break;
          case "launch":
          file.editor = "templates/launch.html";
          break;
          case "results":
          file.editor = "templates/results.html";
          break;
          default:
          file.content = data;
          file.textonly = true;
          file.editor = "templates/text.html";
          valid = false;
          file.textmode = true;
          break;
        }

      }

      FileManager.filesOpened.push(file);
      FileManager.activateFile(file);

  };

  return FileManager;
});
