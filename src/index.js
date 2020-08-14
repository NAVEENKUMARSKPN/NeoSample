import * as tsnejs from "tsne";
import { getNodes, getRelationships, getPositions } from "./neoStore";
import { draw, setup } from "./renderer";
import nodes from "./cachedData/nodes.json";
import rels from "./cachedData/rels.json";

async function layout() {
  const opt = {
    epsilon: 10,
    perplexity: 30,
    dim: 2
  };

  const tsne = new tsnejs.tSNE(opt);

  // using prepared data instead since can not host a long living neo4j instance
  // const nodes = await getNodes();
  // let rels = await getRelationships();

  const nodeData = nodes.map((node) => ({
    id: node.id,
    group: node.group
  }));

  const relData = rels
    .filter(
      (rel) =>
        nodes.find((n) => n.id === rel.fromId) &&
        nodes.find((n) => n.id === rel.toId) &&
        rel.toId !== rel.fromId
    )
    .map((rel) => ({
      source: rel.fromId,
      target: rel.toId
    }));

  setup({
    nodes: nodeData,
    links: relData
  });

  const dists = nodes.map((node) => node.vector);
  tsne.initDataRaw(dists);

  let iterations = 0;

  const step = () => {
    for (let j = 0; j < 3; j++) {
      tsne.step();
    }

    iterations++;

    var yArray = tsne.getSolution();

    yArray.forEach((xy, index) => {
      const node = nodeData[index];
      node.x = xy[0] * 35;
      node.y = xy[1] * 35;
    });

    draw({
      nodes: nodeData,
      links: relData
    });

    if (iterations < 500) {
      if (iterations > 100) {
        setTimeout(() => window.requestAnimationFrame(step), 5);
      } else {
        window.requestAnimationFrame(step);
      }
    }
  };

  window.requestAnimationFrame(step);
}

layout();
