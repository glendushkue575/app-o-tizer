/* 

File Name: ComplexCodeExample.js

Description: This code demonstrates a complex example of a real-time data visualization dashboard using JavaScript and D3.js library. The dashboard visualizes real-time data from an imaginary sensor network.

*/

// Import necessary libraries
const d3 = require('d3');
const io = require('socket.io-client');

// Create a WebSocket connection to the server
const socket = io('http://localhost:3000');

// Define dashboard dimensions
const width = 800;
const height = 600;
const margin = { top: 20, right: 20, bottom: 30, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Create scales for x and y axes
const xScale = d3.scaleTime()
  .range([0, innerWidth]);
const yScale = d3.scaleLinear()
  .range([innerHeight, 0]);

// Create axes
const xAxis = d3.axisBottom(xScale).ticks(10);
const yAxis = d3.axisLeft(yScale).ticks(5);

// Append axes to the SVG element
svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  .attr('class', 'x-axis')
  .call(xAxis);

svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  .attr('class', 'y-axis')
  .call(yAxis);

// Create line generator
const line = d3.line()
  .x(d => xScale(d.timestamp))
  .y(d => yScale(d.value));

// Define data object to store real-time sensor values
let data = [];

// Define update function to redraw the chart with new data
function updateChart(newData) {
  // Update data
  data = newData;

  // Update scales domain based on new data
  xScale.domain(d3.extent(data, d => d.timestamp));
  yScale.domain([0, d3.max(data, d => d.value)]);

  // Update x and y axes
  svg.select('.x-axis')
    .transition()
    .duration(500)
    .call(xAxis);

  svg.select('.y-axis')
    .transition()
    .duration(500)
    .call(yAxis);

  // Update line path
  svg.select('.line')
    .datum(data)
    .transition()
    .duration(500)
    .attr('d', line);

  // Add circles representing data points
  const circles = svg.selectAll('.data-point')
    .data(data, d => d.timestamp);

  circles.enter()
    .append('circle')
    .attr('class', 'data-point')
    .attr('cx', d => xScale(d.timestamp))
    .attr('cy', d => yScale(d.value))
    .attr('r', 5)
    .merge(circles)
    .transition()
    .duration(500)
    .attr('cx', d => xScale(d.timestamp))
    .attr('cy', d => yScale(d.value));

  circles.exit()
    .transition()
    .duration(500)
    .attr('r', 0)
    .remove();
}

// Subscribe to real-time data updates
socket.on('data', newData => {
  updateChart(newData);
});

// Initialize the dashboard with initial data
socket.emit('init');

// Add line path to SVG
svg.append('path')
  .attr('class', 'line')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  .style('fill', 'none')
  .style('stroke', 'steelblue')
  .style('stroke-width', '2px');

// Add title to the chart
svg.append('text')
  .attr('transform', `translate(${margin.left}, ${margin.top - 10})`)
  .attr('class', 'chart-title')
  .text('Real-time Sensor Data Dashboard');

// Add axis labels
svg.append('text')
  .attr('transform', `translate(${width / 2}, ${height - margin.bottom})`)
  .attr('class', 'x-axis-label')
  .text('Time');

svg.append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', margin.left - 40)
  .attr('x', -(height / 2))
  .attr('class', 'y-axis-label')
  .text('Value');