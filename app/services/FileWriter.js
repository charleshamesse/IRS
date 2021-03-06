'use strict';

angular.module('app')
.service('FileWriter', function ($filter, RScripts) {

  // Globals and dependencies
  var fs = require('fs'),
      cp = require('child_process'),
	  mpath = require('path'),
      mkdirp = require('mkdirp');
  //cp.execFileSync(process.env.SHELL, ['-i', '-c', 'launchctl setenv PATH "$PATH"']);
  const fixPath = require('fix-path');
  fixPath();

  // Refactor
  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };

  // Main write method
  this.write = function(path, content) {
    fs.writeFileSync(path, content, 'utf8', (err) => {
      if (err) console.log(err);
    });
	console.log("writing to " + path);
  }

  // Content generation
  this.makeResourcesDir = function(path) {
    var dir = mkdirp.sync(path);
    if(!dir) alert('Error: IR Studio could not create the exploration directory.');
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

  /** New files **/
  var prototypes = {
    "scenario": `{
      "type": "setup",
      "content": {
        "instances": {
          "testing_uri": "",
          "training_uri": ""
        },
        "parameters": [],
        "candidates": {
          "parameters": [],
          "candidates": [],
          "candidates_parameters": []
        },
        "hookrun_uri": "",
        "history": [{
          "date": "` + Date.now() + `",
          "text": "File creation"
        }]
      }
    }`,
    "exploration": `{
      "type": "launch",
      "content": {
        "explorations": [],
        "scenario_uri": "",
        "history": []
      }
    }`
  };

  this.createSetupFile = function(path) {
    return this.write(path, prototypes.scenario);
  }

  this.createExplorationFile = function(path) {
    return this.write(path, prototypes.exploration);
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
    content += '\n';
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
  this.writeCandidatesFile = function(path, candidates, parameters) {
    // Globals
    var content = "### INITIAL CANDIDATES\n### AUTO-GENERATED BY IR STUDIO\n";
    // Treat the first line
    parameters.forEach(function(p) {
      content += p + "\t"
    });
    content += "\n";
    // And the rest
    candidates.forEach(function(c) {
      angular.forEach(c.values, function(v) {
        content += v + "\t";
      });
      content += "\n";
    });

    // Write
    return this.write(path, content);
  };

	// Irace scenario
	this.writeIraceScenarioFile = function(path, parameterFile, execDir, trainInstancesFile, testInstancesFile, initCandidatesFile, hookRunFile) {
		var content = `###################################################### -*- mode: r -*- #####
## Scenario setup for Iterated Race (iRace).
############################################################################

## To use the default value of a parameter of iRace, simply do not set
## the parameter (comment it out in this file, and do not give any
## value on the command line).

## File that contains the description of the parameters.
parameterFile = "` + parameterFile + `"

## Directory where the programs will be run.
execDir = "` + execDir + `"

## File to save tuning results as an R dataset, either absolute path
## or relative to execDir.
logFile = "./irace.Rdata"

## Directory where tuning instances are located, either absolute path or
## relative to current directory.
# trainInstancesDir = "./Instances"

## File with a list of instances and (optionally) parameters.
## If empty or NULL, do not use a file.
trainInstancesFile = "` + trainInstancesFile + `"

## A file containing a list of initial configurations.
## If empty or NULL, do not use a file.
configurationsFile = "` + initCandidatesFile +`"

## The script called for each configuration that launches the program to be
## tuned.  See templates/target-runner.tmpl
targetRunner = "` + hookRunFile + `"

## Number of times to retry a call to target-runner if the call failed.
# targetRunnerRetries = 0

## Optional data passed to targetRunner. This is ignored by the default
## targetRunner function, but it may be used by custom targetRunner functions
## to pass persistent data around.
# targetRunnerData = NULL

## Optional R function to provide custom parallelization of target.runner.  The
## signature of this function should be 'function(experiments, target.runner,
## scenario)', where target.runner is an R function, 'experiments' is a list
## such that each of its elements will be the argument to one call of
## target.runner, and scenario will also be passed to every call. See
## help(target.runner.default) for details.
# targetRunnerParallel = NULL

## Optional script that provides a numeric value for each configuration.
## See templates/target-evaluator.tmpl
# targetEvaluator = ""

## The maximum number of runs (invocations of targetRunner) that will
## performed. It determines the (maximum) budget of experiments for the tuning.
# maxExperiments = 1000

## Directory where testing instances are located, either absolute or relative
## to current directory.
# testInstancesDir = ""

## File containing a list of test instances and optionally additional
## parameters for them.  If empty or NULL, do not use a file.
testInstancesFile = "` + testInstancesFile + `"

## Number of elite configurations returned by irace that will be tested
## if test instances are provided.
testNbElites = 1

## Enable/disable testing the elite configurations found at each iteration.
testIterationElites = 0

## Indicates the number of decimal places to be considered for the
## real parameters.
# digits = 4

## A value of 0 silences all debug messages. Higher values provide
## more verbose debug messages.
# debugLevel = 0

## Number of iterations of Race. Do not use something else than the
## default (that is, the dynamic value) unless you know exactly what
## you are doing.
# nbIterations = 0

## Number of experiments per iteration. Do no use something else than
## the default (that is, the dynamic value) unless you know exactly
## what you are doing.
# nbExperimentsPerIteration = 0

## Sample the instances or take them always in the same order.
# sampleInstances = 1

## Specifies the statistical test type: F-test or t-test.
# testType = "F-test"

## Specifies how many instances are seen before the first elimination
## test. It must be a multiple of eachTest.
# firstTest = 5

## Specifies how many instances are seen between elimination tests.
# eachTest = 1

## The minimum number of configurations that should survive to continue one
## iteration. Do not use something else than the default (that is, the
## dynamic value) unless you know exactly what you are doing.
# minNbSurvival = 0

## The number of configurations that should be sampled and evaluated at
## each iteration. Do no use something else than
## the default (that is, the dynamic value) unless you know exactly
## what you are doing.
# nbConfigurations = 0

## This value is used to determine the number of configurations
## to be sampled and evaluated at each iteration. Use
## the default unless you know exactly what you are doing.
# mu = 5

## Enable/disable deterministic algorithm mode, if enabled irace
## will not use an instance more that once in each race. Note that
## if the number of instances provided is less than firstTest, no
## statistical test will be performed. 
# deterministic = 0

## Seed of the random number generator (must be a positive integer, NA
## means use a random seed).
# seed = NA

## Number of calls to targetRunner to execute in parallel. Less than 2
## means calls to targetRunner are sequentially executed.
# parallel = 0

## Enable/disable load-balancing when executing experiments in
## parallel. Load-balancing makes better use of computing resources, but
## increases communication overhead. If this overhead is large, disabling
## load-balancing may be faster.
# loadBalancing = 1

## Enable/disable SGE cluster mode. Use qstat to wait for
## cluster jobs to finish (targetRunner must invoke qsub).
# sgeCluster = 0

## Enable/disable MPI. Use MPI to execute targetRunner in parallel
## (parameter parallel is the number of slaves).
# mpi = 0

## Enable/disable the soft restart strategy that avoids premature convergence
## of the probabilistic model.
# softRestart = 1

## Confidence level for the elimination test.
# confidence = 0.95

## Previously saved log file to recover the execution of irace, either
## absolute path or relative to the current directory. If empty or
## NULL, recovery is not performed.
# recoveryFile = ""

## File containing a list of logical expressions that cannot be true
## for any evaluated configuration. If empty or NULL, do not use a file.
# forbiddenFile = ""

## Enable/disable elitist irace.
# elitist = 1

## Number of instances to add to execution list before previous instances in
## elitist irace.
# elitistInstances  = 1

## Limit for the elitist race, number of statistical test performed without 
## elimination of configurations.
# elitistLimit  = 2

## END of scenario file
############################################################################`;

		// Write
		return this.write(path, content);
	}

  /** Exporting explorations to result files **/
  this.writeSingleExport = function(path, result, name, command, dates) {
    var res,
    lines = [],
    lines2 = [],
    exportNow = false;
    switch(command.type) {
      case 'full':
      lines = result.trim().split('\n');
      angular.forEach(lines, function(l) {
        l = l.trim();
        if(exportNow)
        lines2.push(l);
        if(l == '### EXECUTING FULL EXPLORATION')
        exportNow = true;
      });
      break;
		case 'ablation':
			lines = result.trim().split('\n');
			angular.forEach(lines, function(l) {
				l = l.trim();
				if(exportNow)
					lines2.push(l);
				if(l == '### EXECUTING FULL EXPLORATION')
					exportNow = true;
			});
			break;
		case 'irace':
			lines2 = result.trim().split('\n');
			break;
    }
    var content = {
      "type": "results",
      "content": {
        "dates": dates,
        "command": command,
        "stdout": lines2,
        "text": {
          "title": name,
          "abstract": "",
          "author": "",
          "firstGraph": "",
          "secondGraph": "",
          "conclusion": ""
        }
      }
    };
    return this.write(path, JSON.stringify(content));
  };

  this.writeBatchExport = function(path, explorations) {
    var content = {
      "type": "results-multiple",
      "content": {
        "explorations": explorations
      }
    };
    return this.write(path, JSON.stringify(content));
  }

  /** LaTeX Export **/
  function getParameterString(parameters, type) {
    var str;
    if(type == "short") {
      var parameterList = "";
      angular.forEach(parameters.list, function(p) {
        parameterList += p.name + ', ';
      });
      parameterList = parameterList.slice(0, -2);

      str = `
      \\subsection{Parameter space}
      The parameter space includes the following: ` + parameterList + `. The numbers of parameters of each type is:
      \\begin{itemize}
      \\item \\textbf{Integer:} ` + parameters.numbers.i + ` \\\\
      \\item \\textbf{Real:} ` + parameters.numbers.r + `\\\\
      \\item \\textbf{Categorical:} ` + parameters.numbers.c + `\\\\
      \\item \\textbf{Order:} ` +  parameters.numbers.o + `
      \\end{itemize}`;
    }
    else {
      var types = {
        "i": "Integer",
        "c": "Categorical",
        "o": "Order",
        "r": "Real"
      };
      str = `\\subsection{Parameter space}
      The parameter space includes the following:
      \\begin{enumerate}`;
      angular.forEach(parameters.list, function(p) {
        var cdts = "";
        if(p.conditions != "") {
          cdts = `, ` + p.conditions.replaceAll('&', '\\&')
          .replaceAll('%', '\\%')
          .replaceAll('#', '\\#')
          .replaceAll('_', '\\_')
          .replaceAll('{', '\\{')
          .replaceAll('}', '\\{')
          .replaceAll('~', '\\~');
        }
        str += `\\item \\textbf{` + p.name + `} [` + types[p.type] + `, "` + p.switch + `"]: ` + p.values +  cdts;
      });

      str += `\\end{enumerate}`;
    }
    return str;
  }

  function getCandidateString(candidates) {
    var candidateString = "";
    angular.forEach(candidates, function(c) {
      console.log(c);
      var valueString = "";
      angular.forEach(c.values, function(v) {
        valueString += v + ', ';
      });
      valueString = valueString.slice(0, -2);
      candidateString += `\\item \\textbf{` + c.label + `} [` + valueString + `] \\\\`;
    });
    candidateString = candidateString.slice(0, -2);
    return candidateString;
  }

  function getParameterSelectionString(ps, type) {
    var str = "\\" + (type == "multiple" ?  "sub" : "" ) + "subsection{Parameter selection} The following parameters were used for this exploration: ";
    angular.forEach(ps, function(p) {
      str += p + ", ";
    });
    str = str.slice(0, -2) + ".";

    return str;
  }

  function getPathString(cmd, type) {
    var str = "\\" + (type == "multiple" ?  "sub" : "" ) + `subsection{Paths}
    The files generated for this exploration were located at:
    \\begin{itemize}
    \\item \\textbf{Parameters:} ` + cmd.parameterFile + ` \\\\
    \\item \\textbf{Parameter selection:} ` + cmd.selectionFile + ` \\\\
    \\item \\textbf{Candidates:} ` + cmd.candidatesFile + ` \\\\
    \\item \\textbf{Log:} ` + cmd.logFile + ` \\\\
    \\end{itemize}`;
    return str;
  }

  function getInstanceString(cmd) {
    var str = "\\subsection{Instances}";

    var data = fs.readFileSync(cmd.instanceFile, 'utf8');
    if (!data) dialog.showMessageBox('Error', 'Unable to open instances file: ' + cmd.instanceFile + '\n');

    var lines = data.split('\n'),
        count = 0;

    angular.forEach(lines, function(l) {
      if(l != "") ++count;
    });
    str += `The instances were fetched from ` + cmd.instanceFile + `, which contains ` + count + ` elements.`;

    return str;
  }
  this.writeSingleExplorationTeXFile = function(dir, text, dates, command, scenario, plots, compile) {
    // Globals
    var parameterString = getParameterString(scenario.parameters, scenario.type),
    candidateString = getCandidateString(scenario.candidates),
    parameterSelectionString = "",
    pathString = "",
    instanceString = "";

    console.log(scenario);

    if(scenario.type == "long") {
      parameterSelectionString = getParameterSelectionString(scenario.parameterSelection, "single");
      pathString = getPathString(command, "single");
      instanceString = getInstanceString(command);
    }

    var content =`
    \\documentclass[12pt]{article}
    \\title{` + text.title + `}
    \\author{` + text.author + `}
    \\date{\\today}
    \\usepackage{float}
    \\usepackage{graphicx}
    \\usepackage[a4paper,left=2.2cm,right=2.2cm,top=2.6cm,bottom=2.6cm]{geometry}
    \\setlength{\\parindent}{0pt}
    \\begin{document}
    \\maketitle
    \\begin{abstract}
    ` + text.abstract + `
    \\end{abstract}
    \\section{Scenario}
    ` + parameterString + `
    ` + instanceString + `
    \\subsection{Hook-run method}
    The hook-run method was located at ` + command.hookRun + `.
    \\section{Exploration}
    \\subsection{Timing}
    The exploration was carried out using \\textsc{` + command.type + `} on ` + command.parallel + ` CPU cores from ` +  $filter('date')(dates[0], 'medium')  + ` to ` +  $filter('date')(dates[1], 'medium') + `.
    ` + parameterSelectionString + `
    \\subsection{Initial candidates}
    The initial candidates for this exploration were (the parameter values are given in the same order as the parameter list in the previous section):
    \\begin{enumerate}
    ` + candidateString + `
    \\end{enumerate}
    ` + pathString + `
    \\section{Results}
    \\begin{figure}[H]
    \\centering
    \\includegraphics[width=\\linewidth]{` + dir + `` + plots[0] + `}
    \\end{figure}` + text.firstGraph + `\\begin{figure}[H]
    \\centering
    \\includegraphics[width=\\linewidth]{` + dir + `` + plots[1] + `}
    \\end{figure}` + text.secondGraph + `
    \\section{Conclusion}
    ` + text.conclusion + `

    \\end{document}`;
    this.write(dir + "report.tex", content);

    fs.writeFileSync(dir + "report.tex", content, 'utf8');
    // Compile
    if(compile) {
      var pdflatex  = cp.exec('pdflatex -interaction=nonstopmode -output-directory="' + dir + '" "' + dir + 'report.tex"');

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



  // Multiple export

  this.writeMultipleExplorationTeXFile = function(dir, explorations, text, scenario, compile) {
    // Globals
    console.log(scenario);
    var parameterString = getParameterString(scenario.parameters, scenario.type),
    candidateString = getCandidateString(scenario.candidates),
    parameterSelectionString = "",
    pathString = "",
    instanceString = "";

    if(scenario.type == "long") {
      parameterSelectionString = getParameterSelectionString(scenario.parameterSelection, "multiple");
      pathString = getPathString(explorations[0].command, "multiple");
      instanceString = getInstanceString(explorations[0].command);
    }

    var content =`
    \\documentclass[12pt]{article}
    \\title{` + text.title + `}
    \\author{` + text.author + `}
    \\date{\\today}
    \\usepackage{float}
    \\usepackage{graphicx}
    \\usepackage[a4paper,left=2.2cm,right=2.2cm,top=2.6cm,bottom=2.6cm]{geometry}
    \\setlength{\\parindent}{0pt}
    \\begin{document}
    \\maketitle
    \\begin{abstract}
    ` + text.abstract + `
    \\end{abstract}
    \\section{Scenario}
    ` + parameterString + `
    ` + instanceString + `
    \\subsection{Hook-run method}
    The hook-run method was located at ` + explorations[0].command.hookRun + `.
    \\section{Explorations}`;

    angular.forEach(explorations, function(e) {
      content += `\\subsection{` + e.name + `}
      \\subsubsection{Timing}
      The exploration was carried out using \\textsc{` + e.command.type + `} on ` + e.command.parallel + ` CPU cores from ` +  $filter('date')(e.dates[0], 'medium')  + ` to ` +  $filter('date')(e.dates[1], 'medium') + `.
      ` + parameterSelectionString + `
      \\subsubsection{Initial candidates}
      The initial candidates for this exploration were (the parameter values are given in the same order as the parameter list in the previous section):
      \\begin{enumerate}
      ` + candidateString + `
      \\end{enumerate}
      ` + pathString + `
      \\subsubsection{Results}
      \\begin{figure}[H]
      \\centering
      \\includegraphics[width=\\linewidth]{` + dir + `` + e.plots[0] + `}
      \\end{figure}` + e.text.firstGraph + `\\begin{figure}[H]
      \\centering
      \\includegraphics[width=\\linewidth]{` + dir + `` + e.plots[1] + `}
      \\end{figure}` + e.text.secondGraph;

    });
/*
    content += `\\subsection{Timing}
    The exploration was carried out using \\textsc{` + command.type + `} on ` + command.parallel + ` CPU cores from ` +  $filter('date')(dates[0], 'medium')  + ` to ` +  $filter('date')(dates[1], 'medium') + `.
    ` + parameterSelectionString + `
    \\subsection{Initial candidates}
    The initial candidates for this exploration were (the parameter values are given in the same order as the parameter list in the previous section):
    \\begin{enumerate}
    ` + candidateString + `
    \\end{enumerate}
    ` + pathString + `
    \\section{Results}
    \\begin{figure}[H]
    \\centering
    \\includegraphics[width=\\linewidth]{` + dir + `` + plots[0] + `}
    \\end{figure}` + text.firstGraph + `\\begin{figure}[H]
    \\centering
    \\includegraphics[width=\\linewidth]{` + dir + `` + plots[1] + `}
    \\end{figure}` + text.secondGraph;
*/
    content += `
    \\section{Conclusion}
    ` + text.conclusion + `
    \\end{document}`;

    this.write(dir + "report.tex", content);
    // Compile
    if(compile) {
      var pdflatex  = cp.exec('pdflatex -interaction=nonstopmode -output-directory="' + dir + '" "' + dir + 'report.tex"');

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


    }
  };


	// Write R scripts
	this.writeRScripts = function(path) {
		var dir = mkdirp.sync(path + "rscripts") || path + 'rscripts';
		this.write(dir + mpath.sep + 'explore.R', RScripts.getExplore());
		this.write(dir + mpath.sep + 'getIraceInfo.R', RScripts.getIraceInfo());
		this.write(dir + mpath.sep + 'getIterationCandidates.R', RScripts.getIterationCandidates());
		this.write(dir + mpath.sep + 'getTestByIteration.R', RScripts.getTestByIteration());
		this.write(dir + mpath.sep + 'getTestElites.R', RScripts.getTestElites());
		console.log("R scripts written");
	}
});
