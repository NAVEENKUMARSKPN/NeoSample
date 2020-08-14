import * as d3 from "d3";

const width = 1024;
const height = 768;
const scale = d3.scaleOrdinal(d3.schemeCategory10);

let svg;
let node;
let link;

export const setup = data => {
  const getColor = d => scale(d.group);

  svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .attr("stroke-width", 1);

  node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("fill", getColor);
};

export const draw = data => {
  node.attr("transform", function(d) {
    const dx = d.x + width / 2;
    const dy = d.y + height / 2;
    return "translate(" + dx + "," + dy + ")";
  });

  const getNodePosition = nodeId => {
    const node = data.nodes.find(n => n.id === nodeId);
    return {
      x: node.x + width / 2,
      y: node.y + height / 2
    };
  };

  link
    .attr("x1", d => getNodePosition(d.source).x)
    .attr("y1", d => getNodePosition(d.source).y)
    .attr("x2", d => getNodePosition(d.target).x)
    .attr("y2", d => getNodePosition(d.target).y);
};
