'use strict';

angular.module('app')
.factory('FileManager', function($filter){
  var FileManager = {};
  var fs = require('fs');
  var path = require("path");
  var remote = require('remote');
  var dialog = remote.require('dialog');

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

  // Save
  FileManager.save = function() {
    var currentFile;
    if((currentFile = $filter('filter')(FileManager.filesOpened, {active: true}, true)[0]) == null) {
      return 0;
    }
    fs.writeFile(currentFile.path, JSON.stringify(currentFile.content), 'utf8', (err) => {
      if (err) throw err;
    });
  }
  // Save as
  FileManager.saveAs = function() {
    var currentFile;
    if((currentFile = $filter('filter')(FileManager.filesOpened, {active: true}, true)[0]) == null) {
      return 0;
    }
    var options = {filters: [{ name: 'IR Studio files', extensions: ['ir'] }]};
    dialog.showSaveDialog(options, function(path) {
      fs.writeFile(path, JSON.stringify(currentFile.content), 'utf8', (err) => {
        if (err) throw err;
      });
    });
  }

  // Close
  FileManager.close = function(index) {
    // Ask for saving - or save
    FileManager.save(FileManager.filesOpened[index]);

    // Close file
    FileManager.filesOpened[index].isOpened = false;
    FileManager.filesOpened.splice(index, 1);
    if(FileManager.filesOpened[index-1] != null) {
      FileManager.viewFile(FileManager.filesOpened[index-1]);
    }
    else if (FileManager.filesOpened[index] != null) {
      FileManager.viewFile(FileManager.filesOpened[index+1]);
    }
  };

  return FileManager;
});
