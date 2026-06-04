import neo4j from 'neo4j-driver';

let _driver = null;

export function isNeo4jConfigured() {
  return !!(
    process.env.NEO4J_URI &&
    process.env.NEO4J_USERNAME &&
    process.env.NEO4J_PASSWORD
  );
}

function getDriver() {
  if (!_driver && isNeo4jConfigured()) {
    _driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
      { maxConnectionPoolSize: 10 }
    );
  }
  return _driver;
}

export async function runQuery(cypher, params = {}) {
  const driver = getDriver();
  if (!driver) throw new Error('Neo4j not configured');
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export function toNum(val) {
  if (val == null) return 0;
  return typeof val.toNumber === 'function' ? val.toNumber() : Number(val);
}

/** Find a WasteItem node by fuzzy name match + its full context */
export async function findItemContext(itemName) {
  const name = itemName.toLowerCase();
  const records = await runQuery(
    `MATCH (w:WasteItem)
     WHERE toLower(w.name) CONTAINS $name OR $name CONTAINS toLower(w.name)
     OPTIONAL MATCH (w)-[:BELONGS_TO]->(c:Category)
     OPTIONAL MATCH (w)-[:MADE_OF]->(m:Material)
     OPTIONAL MATCH (w)-[:DISPOSED_VIA]->(d:DisposalMethod)
     OPTIONAL MATCH (d)-[:USES_BIN]->(b:BinType)
     RETURN w, c, m, d, b
     LIMIT 1`,
    { name }
  );
  return records.length > 0 ? records[0] : null;
}

/** Find a random item in a given category (fallback) */
export async function findItemByCategory(categoryName) {
  const records = await runQuery(
    `MATCH (w:WasteItem)-[:BELONGS_TO]->(c:Category)
     WHERE toLower(c.name) CONTAINS toLower($cat)
     OPTIONAL MATCH (w)-[:MADE_OF]->(m:Material)
     OPTIONAL MATCH (w)-[:DISPOSED_VIA]->(d:DisposalMethod)
     OPTIONAL MATCH (d)-[:USES_BIN]->(b:BinType)
     RETURN w, c, m, d, b
     LIMIT 1`,
    { cat: categoryName }
  );
  return records.length > 0 ? records[0] : null;
}

/** Get related items in the same category */
export async function getRelatedItems(categoryName, excludeName) {
  const records = await runQuery(
    `MATCH (w:WasteItem)-[:BELONGS_TO]->(c:Category)
     WHERE toLower(c.name) CONTAINS toLower($cat)
       AND NOT toLower(w.name) CONTAINS toLower($excl)
     RETURN w LIMIT 5`,
    { cat: categoryName, excl: excludeName.toLowerCase() }
  );
  return records.map((r) => r.get('w').properties);
}

/** Count items in a category */
export async function getCategoryCount(categoryName) {
  const records = await runQuery(
    `MATCH (w:WasteItem)-[:BELONGS_TO]->(c:Category)
     WHERE toLower(c.name) CONTAINS toLower($cat)
     RETURN count(w) AS cnt`,
    { cat: categoryName }
  );
  return records.length > 0 ? toNum(records[0].get('cnt')) : 0;
}
