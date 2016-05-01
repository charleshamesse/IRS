angular.module('app')
.controller('IndexController', function($scope, FileExplorer, FileManager) {

  $scope.FileExplorer = FileExplorer;
  $scope.FileManager = FileManager;

  const remote = require('remote');

  // To-do:
  var template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Scenario',
        },
        {
          label: 'New Exploration',
        },
        {
          label: 'Open...',
          click: function(item, focusedWindow) {
            var ret = $scope.FileExplorer.open();
            // If it is a file, pass it to FileManager
            if(ret.type == "file") FileManager.openFile(ret);
            $scope.$apply();
            /*
            if($scope.FileExplorer.open()) {
              $scope.FileExplorer = FileExplorer;
              console.log("Updating");
            }
            */
          },
          accelerator: 'CmdOrCtrl+O',
        },
        {
          type: 'separator'
        },
        {
          label: 'Save',
          click: function(item, focusedWindow) {
            $scope.FileManager.save();
          },
          accelerator: 'CmdOrCtrl+S',
        },
        {
          label: 'Save As...',
          click: function(item, focusedWindow) {
            $scope.FileManager.saveAs();
          },
          accelerator: 'Shift+CmdOrCtrl+S',
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function(item, focusedWindow) {
            if (focusedWindow)
            focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function() {
            if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
            else
            return 'F11';
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (function() {
            if (process.platform == 'darwin')
            return 'Alt+Command+I';
            else
            return 'Ctrl+Shift+I';
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
            focusedWindow.toggleDevTools();
          }
        },
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
        },
      ]
    },
  ];

  if (process.platform == 'darwin') {
    var name = remote.app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          label: 'About ' + name,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + name,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() { remote.app.quit(); }
        },
      ]
    });
    // Window menu.
    template[3].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    );
  }
  const Menu = remote.Menu;
  const MenuItem = remote.MenuItem;

  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

});
