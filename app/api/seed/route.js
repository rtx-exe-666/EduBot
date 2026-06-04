import { seedCurriculum } from '@/lib/edubot-neo4j';

export async function POST() {
  try {
    const steps = await seedCurriculum();
    return Response.json({ success: true, steps });
  } catch (err) {
    console.error('Seed error:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ message: 'POST to this endpoint to seed NCERT curriculum into Neo4j' });
}
