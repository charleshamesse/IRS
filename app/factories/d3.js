angular.module('app')
.factory('d3',[function(){
  var d3 = require('d3');// paste in a version of d3.min.js here
  return d3;
}])
.directive('d3Bars', ['d3', function(d3) {
  return {
    restrict: 'EA',
    scope: {
      data: "=",
      label: "@",
    },
    link: function(scope, iElement, iAttrs) {
      // create the svg to contain our visualization
      var svg = d3.select(iElement[0])
      .append("svg")
      .attr("width", "100%");

      // make the visualization responsive by watching for changes in window size
      window.onresize = function() {
        return scope.$apply();
      };
      scope.$watch(function() {
        return angular.element(window)[0].innerWidth;
      }, function() {
        return scope.render(scope.data);
      });

      // watch the data source for changes to dynamically update the visualization
      scope.$watch('data', function(newData, oldData) {
        return scope.render(newData);
      }, true);

      scope.render = function(data) {
        // clear out everything in the svg to render a fresh version
        svg.selectAll("*").remove();

        // set up variables
        var width, height, max;
        width = d3.select(iElement[0])[0][0].offsetWidth;
        height = scope.data.length * 40;
        max = 100;
        svg.attr('height', height);

        // SVG rectangles for the bar chart
        svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        // color for bars. set to random. It can be changed to other gradients or solid colors.
        .style({
          fill: '#333'
        })
        // set initial dimensions of the bar
        .attr("height", 30)
        .attr("width", 0)
        // position bar
        .attr("x", 10)
        .attr("y", function(d, i) {
          return i * 35;
        })
        // set up transition animations
        .transition()
        .duration(1250)
        // finally, set the width of the bar based on the datapoint
        .attr("width", function(d) {
          return d.score / (max / width);
        });

        // add labels to the chart
        svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("fill", "white")
        // position labels over their bars
        .attr("y", function(d, i) {
          return i * 35 + 22;
        })
        .attr("x", 15)
        // get the label text from the datapoint
        .text(function(d) {
          return d[scope.label];
        });
      };
    }
  };
}])
.directive('d3Line', ['d3', function(d3) {
  return {
    restrict: 'EA',
    scope: {
      data: "=",
      label: "@",
    },
    link: function(scope, iElement, iAttrs) {
      // create the svg to contain our visualization
      var svg = d3.select(iElement[0])
      .append("svg")
      .attr("width", "100%");

      // make the visualization responsive by watching for changes in window size
      window.onresize = function() {
        return scope.$apply();
      };
      scope.$watch(function() {
        return angular.element(window)[0].innerWidth;
      }, function() {
        return scope.render(scope.data);
      });

      // watch the data source for changes to dynamically update the visualization
      scope.$watch('data', function(newData, oldData) {
        return scope.render(newData);
      }, true);

      scope.render = function(data) {
        // clear out everything in the svg to render a fresh version
        svg.selectAll("*").remove();

        // set up variables
        var width, height, max;
        width = d3.select(iElement[0])[0][0].offsetWidth;
        height = scope.data.length * 40;
        max = 100;
        svg.attr('height', height);

        var
        MARGINS = {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        },
        xScale = d3.scale.linear().range([MARGINS.left, width- MARGINS.right]).domain([2000, 2010]),
        yScale = d3.scale.linear().range([height - MARGINS.top, MARGINS.bottom]).domain([0, 250]),
        xAxis = d3.svg.axis()
        .scale(xScale),
        yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

        svg.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - MARGINS.bottom) + ")")
        .call(xAxis);
        svg.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (MARGINS.left) + ",0)")
        .call(yAxis);
        var lineGen = d3.svg.line()
        .x(function(d) {
          return xScale(d.year);
        })
        .y(function(d) {
          return yScale(d.sale);
        });
        svg.append('svg:path')
        .attr('d', lineGen(data))
        .attr('stroke', 'rgb(82, 154, 189)')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

      };
    }
  };
}])
.directive('d3OrdinalLine', ['d3', function(d3) {
  return {
    restrict: 'EA',
    scope: {
      data: "=",
      label: "@",
    },
    link: function(scope, iElement, iAttrs) {
      // create the svg to contain our visualization
      var svg = d3.select(iElement[0])
      .append("svg")
      .attr("width", "100%");

      // make the visualization responsive by watching for changes in window size
      window.onresize = function() {
        return scope.$apply();
      };
      scope.$watch(function() {
        return angular.element(window)[0].innerWidth;
      }, function() {
        return scope.render(scope.data);
      });

      // watch the data source for changes to dynamically update the visualization
      scope.$watch('data', function(newData, oldData) {
        return scope.render(newData);
      }, true);

      scope.render = function(data) {
        // clear out everything in the svg to render a fresh version
        svg.selectAll("*").remove();

        // set up variables
        var width, height, max;
        width = d3.select(iElement[0])[0][0].offsetWidth;
        height = scope.data.length * 40;
        max = 100;
        svg.attr('height', height);

        var yMax = d3.max(data, function (d) {
          return d.y;
        });
        var xValues = [];
        data.forEach(function(d) {
          xValues.push(d.x);
        });
        var
        MARGINS = {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        },
        yScale = d3.scale.linear().range([height - MARGINS.top, MARGINS.bottom])
        .domain([0, yMax]),
        yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left"),
        xScale = d3.scale.ordinal()
        .domain(xValues)
        .rangePoints([MARGINS.left, width - MARGINS.right]),
        xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

        // Axis
        svg.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - MARGINS.bottom) + ")")
        .call(xAxis);
        svg.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (MARGINS.left) + ",0)")
        .call(yAxis);

        var irsBlue = 'rgb(82, 154, 189)';

        // Grid
        svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + (height-MARGINS.top) + ")")
        .call(xAxis
          .tickSize(-(height-MARGINS.top-MARGINS.bottom), 0, 0)
          .tickFormat(""));

          svg.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(" + MARGINS.left +",0)")
          .call(yAxis
            .tickSize(-(width-MARGINS.left-MARGINS.right), 0, 0)
            .tickFormat(""));

            //Line and dots
            var lineGen = d3.svg.line()
            .x(function(d) {
              return xScale(d.x);
            })
            .y(function(d) {
              return yScale(d.y);
            });
            svg.append('svg:path')
            .attr('d', lineGen(data))
            .attr('stroke', irsBlue)
            .attr('stroke-width', 1)
            .attr('fill', 'none');

            svg.selectAll(".point")
            .data(data)
            .enter().append("svg:circle")
            .attr("stroke", irsBlue)
            .attr("fill", function(d, i) { return "white" })
            .attr("cx", function(d, i) { return xScale(d.x) })
            .attr("cy", function(d, i) { return yScale(d.y) })
            .attr("r", function(d, i) { return 3 })
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

            function handleMouseOver(d, i) {
              // Specify where to put label of text
              d3.select(this).attr({
                r: 5
              });

              var text = svg.append("text").attr({
                id: "t-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
                x: function() { return xScale(d.x) + 15; },
                y: function() { return yScale(d.y) - 15; }
            });

            text.append("svg:tspan").style("fill", irsBlue).text("Performance: ");
            text.append("svg:tspan").attr({x:xScale(d.x) + 15, dy: 15}).style("fill", "black").text(d.y);
            text.append("svg:tspan").attr({x:xScale(d.x) + 15, dy: 15}).style("fill", irsBlue).text("Parameters:");
            text.append("svg:tspan").attr({x:xScale(d.x) + 15, dy: 15}).style("fill", "black").text("P1");
            text.append("svg:tspan").attr({x:xScale(d.x) + 15, dy: 15}).style("fill", "black").text("P2");
            text.append("svg:tspan").attr({x:xScale(d.x) + 15, dy: 15}).style("fill", "black").text("P3");
            text.append("svg:tspan").attr({x:xScale(d.x) + 15, dy: 15}).style("fill", "black").text("P4");


            }

            function handleMouseOut(d, i) {
            // Use D3 to select element, change color back to normal
            d3.select(this).attr({  r: 3 });

            // Select text by id and then remove
            d3.select("#t-" + d.y + "-" + i).remove();  // Remove text location
          }

          };
        }
      };
    }]);
