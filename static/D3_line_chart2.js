"use strict"

// console.log("hello")
var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y%m%d");

    // setting the x&y axis, make sure that any quantity we specify on the x axis fits onto our graph.
     // By using the d3.time.scale() function we make sure that D3 knows to treat the values as date / time 
     // entities (with all their ingrained peculiarities). Then we specify the range that those values 
     // will cover (.range) and we specify the range as being from 0 to the width of our graphing area
var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    // setting the color
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    // Produces a cubic basis spline using the specified control points. 
    .curve(d3.curveBasis)
    // x value of the line is date
    .x(function(d) { return x(d.date); })
    // y value of the line is temperature
    .y(function(d) { return y(d.temperature); });

d3.json('/birds_per_month.json', function(error, data){

// d3.csv('static/data.csv', type, function(error, data) {
  if (error) throw error;

  // var cities = data.columns.slice(1).map(function(id) {
  //   // return {
  //   //   id: id,
  //   //   // values: data.map(function(d) {
  //   //   //   return {date: d.date, temperature: d[id]};
  //   //   // })
  //   // };
  // });
  console.log(cities)
  // returned an object with an ID for the city and 366 arrays of the date:value, temperature:value pairs in an object
  // {id:"New York", [{"date": "Sat Oct 01 2011 00:00:00 GMT-0700 (Pacific Daylight Time)", "temperature": "63.4"}], [{"date": "Sun Oct 02 2011 00:00:00 GMT-0700 (Pacific Daylight Time", "temperature": "58"}]}


  // the .domain function is designed to let D3 know what the scope of the data will be this is what is 
  // then passed to the scale function. Find the min and max; returns an array.
  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.temperature; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.temperature; }); })
  ]);

  z.domain(cities.map(function(c) { return c.id; }));

  // .call() invokes a callback function on the selection itself. D3’s call() function takes the incoming 
  // selection, as received from the prior link in the chain, and hands that selection off to any function. 
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // labels for the Y axis
  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
   .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.90em")
      .attr("fill", "#000")
      .text("This is the Y axis");

  // this section displays the lines
  var city = g.selectAll(".city")
    .data(cities)
    .enter().append("g")
      .attr("class", "city");

  // this section displays the lines
  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

  // thid section labels the lines on the graph
  city.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });
});

// function used to parse csv file
function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}
