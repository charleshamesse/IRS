'use strict';

angular.module('app')
.service('FileWriter', function () {

  // Globals and dependencies
  var fs = require('fs'),
  cp = require('child_process');

  // Main write method
  this.write = function(path, content) {
    fs.writeFile(path, content, 'utf8', (err) => {
      if (err) throw err;
    });
  }

  // Content generation
  this.makeResourcesDir = function(path) {
    fs.stat(path, function(err, stats) {
      //Check if error defined and the error code is "not exists"
      if (err && err.errno === 34) {
        //Create the directory, call the callback.
        fs.mkdir(path, (err) => {
          if (err) throw err;
        });
      }
      // else, it exists
    });
  }

  this.fileExists = function(path) {
    var exists = true;
    fs.stat(path, function(err, stats) {
      //Check if error defined and the error code is "not exists"
      if (err && err.errno === 34) {
        //Create the directory, call the callback.
        exists = false;
      }
      // else, it exists
    });
    return exists;
  }

  /** Exploration **/

  // Parameters
  this.writeParameterFile = function(path, parameters) {
    var content = '### PARAMETER FILE\n### AUTO-GENERATED BY IR STUDIO\n'
    + '#name\tswitch\ttype\tvalues\t[conditions (using R syntax)]';
    parameters.forEach(function(p) {
      content += '\n' + p.name + '\t"' + p.switch + '"\t' + p.type + '\t' + p.values;
      if(p.conditions != "")
      content += '\t| ' + p.conditions;
    });
    return this.write(path, content);
  };

  // Selection
  this.writeSelectionFile = function(path, parameters) {
    var content = "### PARAMETER SELECTION\n### AUTO-GENERATED BY IR STUDIO\n";
    parameters.forEach(function(p) {
      content += p.name + "\n";
    });
    return this.write(path, content);
  };

  // Candidates
  this.writeCandidatesFile = function(path, candidates) {
    // Globals
    var content = "### INITIAL CANDIDATES\n### AUTO-GENERATED BY IR STUDIO\n";

    // Treat the first line
    candidates.parameters.forEach(function(p) {
      content += p + "\t"
    });
    content += "\n";

    // And the rest
    candidates.candidates.forEach(function(c) {
      c.values.forEach(function(v) {
        content += v + "\t";
      });
      content += "\n";
    });

    // Write
    return this.write(path, content);
  };

  /** LaTeX Export **/
  this.writeTeXFile = function(dir, text, plots, relativePath, compile) {
    console.log(text);
    // Globals
    var content =`\\title{` + text.title + `}
\\author{` + text.author + `}
\\date{\\today}
\\documentclass[12pt]{article}
\\usepackage{float}
\\usepackage{graphicx}
\\usepackage[a4paper,left=2.2cm,right=2.2cm,top=2.6cm,bottom=2.6cm]{geometry}
\\begin{document}
\\maketitle
\\begin{abstract}
` + text.abstract + `
\\end{abstract}
\\section{Scenario}
Scenario data
\\section{Exploration}
The exploration was carried out using Full Exploration on 2 CPU cores from startTime to endTime. The parameters used in this exploration are:\\\\
...\\\\
And the initial candidates:\\\\
...
\\section{Results}
\\begin{figure}[H]
\\centering
\\includegraphics[width=\\linewidth]{` + relativePath + `` + plots[0] + `}
\\end{figure}` + text.firstGraph + `\\begin{figure}[H]
\\centering
\\includegraphics[width=\\linewidth]{` + relativePath + `` + plots[1] + `}
\\end{figure}` + text.secondGraph + `
\\section{Conclusion}
` + text.conclusion + `

\\end{document}
This is never printed`;
    this.write(dir + "report.tex", content);

    fs.writeFileSync(dir + "report.tex", content, 'utf8');
    // Compile
    if(compile) {
      var cmd       = 'pdflatex -output-directory=' + dir + ' ' + dir + 'report.tex',
      pdflatex  = cp.exec('pdflatex -interaction=nonstopmode -output-directory=' + dir + ' ' + dir + 'report.tex');

      pdflatex.stdout.on('data', function(data) {
        console.log(data);
      });

      pdflatex.stderr.on('data', function(data) {
        console.log(data);
      });

      pdflatex.on('exit', function(code) {
        console.log("pdftex exit code:" + code);
      });

      console.log("report.pdf created?" + this.fileExists(dir + "report.pdf"));


    };
  }

});
