import { runQuery } from '@/lib/neo4j';
import {
  getTopicConcepts,
  getLearningPath,
  getStudentWeakAreas,
  saveStudyProgress,
  markConceptMastery,
  getRecommendedTopics,
  getStudyProgress,
  getAllSubjectsWithTopics,
  getConceptGraphForViz,
} from '@/lib/edubot-neo4j';

const ALLOWED_OPERATIONS = [
  'getTopicConcepts',
  'getLearningPath',
  'getWeakAreas',
  'saveProgress',
  'markMastery',
  'getRecommended',
  'getProgress',
  'getAllSubjects',
  'getConceptGraph',
  'rawQuery',
];

export async function POST(request) {
  try {
    const { operation, params = {} } = await request.json();

    if (!ALLOWED_OPERATIONS.includes(operation)) {
      return Response.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }

    let result;

    switch (operation) {
      case 'getTopicConcepts':
        result = await getTopicConcepts(params.topic);
        break;
      case 'getLearningPath':
        result = await getLearningPath(params.topic);
        break;
      case 'getWeakAreas':
        result = await getStudentWeakAreas(params.uid);
        break;
      case 'saveProgress':
        await saveStudyProgress(params.uid, params.topic, params.score);
        result = { success: true };
        break;
      case 'markMastery':
        await markConceptMastery(params.uid, params.concept, params.mastered);
        result = { success: true };
        break;
      case 'getRecommended':
        result = await getRecommendedTopics(params.uid);
        break;
      case 'getProgress':
        result = await getStudyProgress(params.uid);
        break;
      case 'getAllSubjects':
        result = await getAllSubjectsWithTopics();
        break;
      case 'getConceptGraph':
        result = await getConceptGraphForViz(params.topic, params.uid);
        break;
      case 'rawQuery':
        // Only allow safe read queries
        if (!params.cypher?.trim().toUpperCase().startsWith('MATCH')) {
          return Response.json({ error: 'Only MATCH queries allowed' }, { status: 403 });
        }
        const records = await runQuery(params.cypher, params.queryParams || {});
        result = records.map((r) => {
          const obj = {};
          r.keys.forEach((k) => { obj[k] = r.get(k); });
          return obj;
        });
        break;
    }

    return Response.json({ data: result });
  } catch (err) {
    console.error('Neo4j route error:', err);
    return Response.json({ error: err.message, data: null }, { status: 500 });
  }
}
