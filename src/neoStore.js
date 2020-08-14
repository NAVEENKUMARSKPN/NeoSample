import { v1 as neo } from "neo4j-driver";

let driver;

const getDriver = () => {
  if (!driver) {
    driver = neo.driver("bolt://localhost:7687", neo.auth.basic("neo4j", "a"));
  }

  return driver;
};

const getSession = () => {
  return getDriver().session();
};

export const getNodes = () => {
  const session = getSession();

  return session
    .run(
      "MATCH (n) where exists(n.oneHotEmbedding) return id(n) as id, n.oneHotEmbedding as vector, n.community as group"
    )
    .then(result => {
      const nodes = result.records.reduce((nodeList, record) => {
        const node = {
          id: `n${record.get("id")}`,
          vector: record.get("vector").map(vec => vec.toInt()),
          group: record.get("group").toInt()
        };
        nodeList.push(node);
        return nodeList;
      }, []);

      return nodes;
    })
    .catch(err => console.log(err));
};

export const getRelationships = () => {
  const session = getSession();

  return session
    .run(
      "match (a)-[:ACTED_IN]->()<-[:ACTED_IN]-(b) where id(a) < id(b) return id(a) as source, id(b) AS target"
    )
    .then(result => {
      const rels = result.records.reduce((relList, record) => {
        const fromId = record.get("source");
        const toId = record.get("target");

        const rel = {
          id: `n${fromId}0${toId}`,
          fromId: `n${fromId}`,
          toId: `n${toId}`,
          properties: {}
        };

        relList.push(rel);
        return relList;
      }, []);

      return rels;
    })
    .catch(err => console.log(err));
};

export const getPositions = () => {
  const session = getSession();

  return session
    .run(
      "MATCH (p:Person)\n" +
        "WITH {item:id(p), weights:p.rogueOneHot} as userData\n" +
        "WITH collect(userData) as data\n" +
        "CALL algo.ml.tsne.stream(data,{perplexity: 10.0, theta: 1.8})\n" +
        "YIELD nodeId, value\n" +
        "RETURN nodeId, value"
    )
    .then(result => {
      const nodes = result.records.reduce((nodeList, record) => {
        const node = {
          id: `n${record.get("nodeId")}`,
          position: record.get("value")
        };
        nodeList.push(node);
        return nodeList;
      }, []);

      console.log(nodes);

      return nodes;
    })
    .catch(err => console.log(err));
};
