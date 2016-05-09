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
        height = 600;
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
          bottom: 200,
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
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" );
        svg.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (MARGINS.left) + "," + (MARGINS.top-MARGINS.bottom) +")")
        .call(yAxis);

        var irsBlue = 'rgb(82, 154, 189)';

        // Grid
        svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + (height-MARGINS.bottom) + ")")
        .call(xAxis
          .tickSize(-(height-MARGINS.top-MARGINS.bottom), 0, 0)
          .tickFormat(""));

          svg.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(" + MARGINS.left +"," + (MARGINS.top-MARGINS.bottom) +")")
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
            .attr('fill', 'none')
            .attr("transform", "translate(0," + (MARGINS.top-MARGINS.bottom) +")");

            svg.selectAll(".point")
            .data(data)
            .enter().append("svg:circle")
            .attr("stroke", irsBlue)
            .attr("fill", function(d, i) { return "white" })
            .attr("cx", function(d, i) { return xScale(d.x) })
            .attr("cy", function(d, i) { return yScale(d.y) })
            .attr("r", function(d, i) { return 3 })
            .attr("transform", "translate(0," + (MARGINS.top-MARGINS.bottom) +")")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

            function handleMouseOver(d, i) {
              // Specify where to put label of text
              d3.select(this).attr({
                r: 5
              });

              var text = svg.append("text").attr({
                id: "t-" + parseInt(d.y) + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
                x: function() { return xScale(d.x) + 15; },
                y: function() { return yScale(d.y) - 15; }
              })
              .attr("transform", "translate(0," + (MARGINS.top-MARGINS.bottom) +")");

              text.append("svg:tspan").style("fill", irsBlue).text("Performance: ");
              text.append("svg:tspan").attr({x:xScale(d.x) + 15, dy: 15}).style("fill", "black").text(d.y);


            }

            function handleMouseOut(d, i) {
              // Use D3 to select element, change color back to normal
              d3.select(this).attr({  r: 3 });

              // Select text by id and then remove
              d3.select("#t-" + parseInt(d.y) + "-" + i).remove();  // Remove text location
            }

          };
        }
      };
    }])
    .directive('d3HorizontalTree', ['d3', function(d3) {
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
            var newDataCopy = JSON.parse(JSON.stringify(scope.data));
            return scope.render(newDataCopy);
          });

          // watch the data source for changes to dynamically update the visualization
          scope.$watch('data', function(newData, oldData) {
            var newDataCopy = JSON.parse(JSON.stringify(newData));
            return scope.render(newDataCopy);
          }, true);

          // Get the tree depth. It is a basic find-max algorithm to find children who have children themse
          var getDepth = function(data) {
            depth = 1;

            node = data[0];

            while(node.children != null && node.children.length != 0 ) {
              depth++;
              max = 0;
              idx = 0;
              i = 0;
              angular.forEach(node.children, function(child) {
                if(child.children.length > max) {
                  max = child.children.length;
                  idx = i;
                }
                i++;
              });
              node = node.children[idx];
            }
            return depth;
          }


          scope.render = function(data) {
            // clear out everything in the svg to render a fresh version
            svg.selectAll("*").remove();

            // set up variables
            var width, height, max, dataDepth;
            dataDepth = getDepth(data);
            width = 180*dataDepth;  //d3.select(iElement[0])[0][0].offsetWidth;
            height = 500;
            svg.attr('height', height);
            svg.attr('width', width);

            // Data management
            var treeData = data;

            // ************** Generate the tree diagram	 *****************
            var margin = {top: 0, right: 120, bottom: 0, left: 120},
            width = 180*dataDepth - margin.right - margin.left, //groups.length
            height = 500 - margin.top - margin.bottom;

            var i = 0,
            duration = 750,
            root;

            var tree = d3.layout.tree()
            .size([height, width]);

            var xOffset = 30;
            var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

            root = treeData[0];
            root.x0 = height / 2;
            root.y0 = 100;

            update(root);


            function update(source) {

              // Compute the new tree layout.
              var nodes = tree.nodes(root).reverse(),
              links = tree.links(nodes);

              // Normalize for fixed-depth.
              nodes.forEach(function(d) { d.y = d.depth * 180 + xOffset; });

              // Update the nodes…
              var node = svg.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

              // Enter any new nodes at the parent's previous position.
              var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
              .on("click", click);

              nodeEnter.append("circle")
              .attr("r", function(d) { return  "20px" })
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

              nodeEnter.append("text")
              .attr("x", function(d) { return 0; //d.children || d._children ? -13 : 13;
              })
              .attr("dy", function(d) { return  -(d.score/30000*20+3) + "px" })//".35em")
              .attr("text-anchor", function(d) {
                return "middle"; //return d.children || d._children ? "end" : "start";
              })
              .text(function(d) { return d.name; })
              .style("fill-opacity", 1e-6);

              // Transition nodes to their new position.
              var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

              nodeUpdate.select("circle")
              .attr("r", function(d) { return  (d.score/30000*20) + "px" })
              .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

              nodeUpdate.select("text")
              .style("fill-opacity", 1);

              // Transition exiting nodes to the parent's new position.
              var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .remove();

              nodeExit.select("circle")
              .attr("r", "20px");

              nodeExit.select("text")
              .style("fill-opacity", 1e-6);

              // Update the links…
              var link = svg.selectAll("path.link")
              .data(links, function(d) { return d.target.id; });

              // Enter any new links at the parent's previous position.
              link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
              });

              // Transition links to their new position.
              link.transition()
              .duration(duration)
              .attr("d", diagonal);

              // Transition exiting nodes to the parent's new position.
              link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
              })
              .remove();

              // Stash the old positions for transition.
              nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
              });
            }

            // Toggle children on click.
            function click(d) {
              if (d.children) {
                d._children = d.children;
                d.children = null;
              } else {
                d.children = d._children;
                d._children = null;
              }
              update(d);
            }
          };
        }
      };
    }]);
