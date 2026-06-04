import { runQuery } from './neo4j.js';

// ─── NCERT Curriculum Seeder ──────────────────────────────────────────────────

export async function seedCurriculum() {
  const steps = [];

  // 1. Subjects
  await runQuery(`
    MERGE (s1:Subject {name:'Mathematics'}) SET s1.icon='📐', s1.color='#FF6B00'
    MERGE (s2:Subject {name:'Physics'}) SET s2.icon='⚛️', s2.color='#7C3AED'
    MERGE (s3:Subject {name:'Chemistry'}) SET s3.icon='🧪', s3.color='#F59E0B'
    MERGE (s4:Subject {name:'Biology'}) SET s4.icon='🌿', s4.color='#10B981'
    MERGE (s5:Subject {name:'History'}) SET s5.icon='📜', s5.color='#EF4444'
    MERGE (s6:Subject {name:'Geography'}) SET s6.icon='🌍', s6.color='#3B82F6'
    MERGE (s7:Subject {name:'English'}) SET s7.icon='📖', s7.color='#EC4899'
    MERGE (s8:Subject {name:'Computer Science'}) SET s8.icon='💻', s8.color='#FF9933'
  `);
  steps.push('✅ Subjects seeded');

  // 2. Mathematics Topics + Concepts
  const mathTopics = [
    {
      name: 'Quadratic Equations',
      desc: 'Equations of degree 2 in the form ax²+bx+c=0',
      difficulty: 3,
      concepts: [
        { name: 'Discriminant', def: 'b²-4ac determines nature of roots', formula: 'D = b² - 4ac', example: 'For x²-5x+6=0: D=25-24=1 (2 distinct real roots)' },
        { name: 'Quadratic Formula', def: 'Formula to find roots of any quadratic', formula: 'x = (-b ± √D) / 2a', example: 'x²-5x+6=0 → x=3 or x=2' },
        { name: 'Sum and Product of Roots', def: 'Vieta\'s formulas relating roots to coefficients', formula: 'α+β = -b/a, αβ = c/a', example: 'x²-5x+6: sum=5, product=6' },
        { name: 'Nature of Roots', def: 'D>0: 2 real, D=0: equal, D<0: complex', formula: 'If D ≥ 0 → real roots', example: 'x²+1=0: D=-4<0 → no real roots' },
      ],
    },
    {
      name: 'Trigonometry',
      desc: 'Study of relationships between angles and sides of triangles',
      difficulty: 4,
      concepts: [
        { name: 'Trigonometric Ratios', def: 'sin, cos, tan defined for right-angled triangle', formula: 'sinθ = P/H, cosθ = B/H, tanθ = P/B', example: 'In 3-4-5 triangle: sin A = 3/5 = 0.6' },
        { name: 'Pythagorean Identity', def: 'Fundamental identity of trigonometry', formula: 'sin²θ + cos²θ = 1', example: 'If sinθ=0.6, cosθ=0.8: 0.36+0.64=1 ✓' },
        { name: 'Compound Angle Formulas', def: 'Formulas for sin/cos of sums of angles', formula: 'sin(A+B) = sinA cosB + cosA sinB', example: 'sin 75° = sin(45°+30°)' },
        { name: 'Inverse Trigonometric Functions', def: 'arcsin, arccos, arctan — reverse of trig functions', formula: 'arcsin(x) ∈ [-π/2, π/2]', example: 'arcsin(0.5) = 30° = π/6' },
      ],
    },
    {
      name: 'Calculus',
      desc: 'Study of rates of change (differentiation) and accumulation (integration)',
      difficulty: 5,
      concepts: [
        { name: 'Derivative', def: 'Rate of change of a function at a point', formula: 'f\'(x) = lim(h→0) [f(x+h)-f(x)]/h', example: 'd/dx(x²) = 2x' },
        { name: 'Power Rule', def: 'Rule for differentiating power functions', formula: 'd/dx(xⁿ) = n·xⁿ⁻¹', example: 'd/dx(x³) = 3x²' },
        { name: 'Integral', def: 'Anti-derivative; area under curve', formula: '∫xⁿdx = xⁿ⁺¹/(n+1) + C', example: '∫x²dx = x³/3 + C' },
        { name: 'Chain Rule', def: 'Derivative of composite functions', formula: 'd/dx[f(g(x))] = f\'(g(x))·g\'(x)', example: 'd/dx[sin(x²)] = cos(x²)·2x' },
      ],
    },
    {
      name: 'Matrices',
      desc: 'Rectangular arrays of numbers with defined operations',
      difficulty: 3,
      concepts: [
        { name: 'Matrix Multiplication', def: 'Product of two matrices A(m×n) and B(n×p) gives C(m×p)', formula: 'C[i][j] = Σ A[i][k]·B[k][j]', example: '[1,2;3,4]×[5;6] = [17;39]' },
        { name: 'Determinant', def: 'Scalar value computed from a square matrix', formula: 'det(A) = ad-bc for 2×2', example: 'det([1,2;3,4]) = 4-6 = -2' },
        { name: 'Inverse Matrix', def: 'Matrix A⁻¹ such that AA⁻¹=I', formula: 'A⁻¹ = (1/det(A)) × adj(A)', example: 'Exists only if det(A) ≠ 0' },
      ],
    },
  ];

  // 3. Physics Topics + Concepts
  const physicsTopics = [
    {
      name: "Newton's Laws",
      desc: 'Three fundamental laws describing motion of objects',
      difficulty: 2,
      concepts: [
        { name: 'First Law (Inertia)', def: 'An object at rest stays at rest unless acted on by force', formula: 'ΣF = 0 ⟹ a = 0', example: 'A book on table stays still until pushed' },
        { name: 'Second Law (F=ma)', def: 'Force equals mass times acceleration', formula: 'F = ma', example: 'Push of 10N on 2kg mass gives a=5 m/s²' },
        { name: 'Third Law (Action-Reaction)', def: 'Every action has equal and opposite reaction', formula: 'F₁₂ = -F₂₁', example: 'Rocket expels gas downward, moves upward' },
      ],
    },
    {
      name: 'Optics',
      desc: 'Study of light and its interaction with matter',
      difficulty: 3,
      concepts: [
        { name: "Snell's Law", def: 'Law governing refraction of light at interface', formula: 'n₁ sinθ₁ = n₂ sinθ₂', example: 'Light bending when entering glass from air' },
        { name: 'Mirror Formula', def: 'Relationship between object distance, image distance, focal length', formula: '1/v + 1/u = 1/f', example: 'Object at 30cm, f=10cm: v=15cm' },
        { name: 'Lens Formula', def: 'For thin lenses in terms of focal length', formula: '1/f = 1/v - 1/u', example: 'Convex lens f=20cm, u=-30cm → v=60cm' },
      ],
    },
    {
      name: 'Thermodynamics',
      desc: 'Study of heat, temperature and energy transfer',
      difficulty: 4,
      concepts: [
        { name: 'First Law', def: 'Energy cannot be created or destroyed, only converted', formula: 'ΔU = Q - W', example: 'Engine takes 1000J heat, does 400J work, ΔU=600J' },
        { name: 'Second Law', def: 'Heat flows naturally from hot to cold; entropy increases', formula: 'ΔS ≥ 0', example: 'Ice melts in warm room, not vice versa' },
        { name: 'Ideal Gas Law', def: 'Relationship between P, V, T for ideal gas', formula: 'PV = nRT', example: 'Double T at constant V → P doubles' },
      ],
    },
  ];

  // 4. Chemistry Topics + Concepts
  const chemistryTopics = [
    {
      name: 'Atomic Structure',
      desc: 'Structure of atoms including electrons, protons and neutrons',
      difficulty: 2,
      concepts: [
        { name: "Bohr's Model", def: 'Electrons orbit nucleus in fixed energy shells', formula: 'Eₙ = -13.6/n² eV', example: 'n=1: E=-13.6eV (ground state of hydrogen)' },
        { name: 'Quantum Numbers', def: 'n, l, m, s describe electron state completely', formula: 'n=1,2,3...; l=0 to n-1', example: '2p electron: n=2, l=1' },
        { name: 'Electronic Configuration', def: 'Arrangement of electrons in orbitals', formula: '1s² 2s² 2p⁶ 3s¹ (Na)', example: 'Carbon: 1s² 2s² 2p²' },
      ],
    },
    {
      name: 'Chemical Bonding',
      desc: 'Forces that hold atoms together in molecules',
      difficulty: 3,
      concepts: [
        { name: 'Ionic Bond', def: 'Transfer of electrons between metals and non-metals', formula: 'Na → Na⁺ + e⁻', example: 'NaCl: Na loses e⁻ to Cl' },
        { name: 'Covalent Bond', def: 'Sharing of electron pairs between atoms', formula: 'H:H → H₂', example: 'H₂O: O shares 2 e⁻ pairs with 2 H' },
        { name: 'Electronegativity', def: 'Tendency to attract bonding electrons', formula: 'Pauling scale: F=4.0 (highest)', example: 'HF polar because F more electronegative than H' },
      ],
    },
  ];

  // 5. Biology Topics + Concepts
  const biologyTopics = [
    {
      name: 'Cell Biology',
      desc: 'Structure and function of cells — basic unit of life',
      difficulty: 2,
      concepts: [
        { name: 'Cell Membrane', def: 'Phospholipid bilayer that controls what enters/exits', formula: 'Fluid-mosaic model', example: 'Glucose enters via facilitated diffusion' },
        { name: 'Mitochondria', def: 'Powerhouse of the cell — produces ATP via aerobic respiration', formula: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38ATP', example: 'More mitochondria in muscle cells' },
        { name: 'DNA Replication', def: 'Copying of DNA before cell division', formula: 'AT, GC base pairing', example: 'Semi-conservative: each new cell gets one old strand' },
      ],
    },
    {
      name: 'Genetics',
      desc: 'Study of heredity and genetic variation',
      difficulty: 4,
      concepts: [
        { name: "Mendel's Laws", def: 'Laws of segregation and independent assortment', formula: 'AA × aa → Aa (all dominant)', example: 'Tall × Dwarf pea: all Tall (F1)' },
        { name: 'DNA Structure', def: 'Double helix with A-T and G-C base pairs', formula: 'Chargaff: %A=%T, %G=%C', example: 'Human DNA: 3 billion base pairs' },
        { name: 'Mutation', def: 'Permanent change in DNA sequence', formula: 'Point mutation: one base change', example: 'Sickle cell: A→T in hemoglobin gene' },
      ],
    },
  ];

  // 6. Computer Science Topics
  const csTopics = [
    {
      name: 'Data Structures',
      desc: 'Ways to organize and store data efficiently',
      difficulty: 3,
      concepts: [
        { name: 'Array', def: 'Fixed-size sequential collection of same-type elements', formula: 'Access: O(1), Search: O(n)', example: 'int arr[5] = {1,2,3,4,5}' },
        { name: 'Linked List', def: 'Dynamic list where each node points to next', formula: 'Insert/Delete: O(1) at head', example: '1→2→3→4→null' },
        { name: 'Binary Search Tree', def: 'Tree where left < root < right for all nodes', formula: 'Search: O(log n) average', example: 'BST of {5,3,7,1,4}: root=5' },
        { name: 'Hash Table', def: 'Key-value store using hash function', formula: 'Average O(1) insert/search', example: 'Python dict: {"name": "Priya"}' },
      ],
    },
    {
      name: 'Algorithms',
      desc: 'Step-by-step procedures to solve computational problems',
      difficulty: 4,
      concepts: [
        { name: 'Sorting Algorithms', def: 'Methods to arrange elements in order', formula: 'QuickSort: O(n log n) avg', example: 'Bubble sort: compare adjacent, swap if needed' },
        { name: 'Binary Search', def: 'Search in sorted array by halving range', formula: 'O(log n)', example: 'Find 7 in [1,3,5,7,9]: check mid=5, go right' },
        { name: 'Dynamic Programming', def: 'Solve problems by breaking into overlapping subproblems', formula: 'Memoization / Tabulation', example: 'Fibonacci: F(n) = F(n-1)+F(n-2)' },
      ],
    },
  ];

  const allSubjectTopics = [
    { subject: 'Mathematics', topics: mathTopics },
    { subject: 'Physics', topics: physicsTopics },
    { subject: 'Chemistry', topics: chemistryTopics },
    { subject: 'Biology', topics: biologyTopics },
    { subject: 'Computer Science', topics: csTopics },
  ];

  for (const { subject, topics } of allSubjectTopics) {
    for (const topic of topics) {
      // Create topic node and link to subject
      await runQuery(
        `MATCH (s:Subject {name:$subject})
         MERGE (t:Topic {name:$topicName})
         ON CREATE SET t.description=$desc, t.difficulty=$diff
         MERGE (s)-[:HAS_TOPIC]->(t)`,
        { subject, topicName: topic.name, desc: topic.desc, diff: topic.difficulty }
      );

      for (const concept of topic.concepts) {
        await runQuery(
          `MATCH (t:Topic {name:$topicName})
           MERGE (c:Concept {name:$cName})
           ON CREATE SET c.definition=$def, c.formula=$formula, c.example=$example
           MERGE (t)-[:HAS_CONCEPT]->(c)`,
          {
            topicName: topic.name,
            cName: concept.name,
            def: concept.def,
            formula: concept.formula,
            example: concept.example,
          }
        );
      }
      steps.push(`✅ ${subject} → ${topic.name} seeded`);
    }
  }

  // Add prerequisite relationships
  const prereqs = [
    ['Calculus', 'Trigonometry'],
    ['Calculus', 'Quadratic Equations'],
    ['Trigonometry', 'Quadratic Equations'],
    ["Newton's Laws", 'Thermodynamics'],
    ['Atomic Structure', 'Chemical Bonding'],
    ['Algorithms', 'Data Structures'],
    ['Genetics', 'Cell Biology'],
  ];

  for (const [from, to] of prereqs) {
    await runQuery(
      `MATCH (a:Topic {name:$from}), (b:Topic {name:$to})
       MERGE (a)-[:REQUIRES]->(b)`,
      { from, to }
    );
  }
  steps.push('✅ Prerequisite links created');

  return steps;
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

export async function getTopicConcepts(topicName) {
  const records = await runQuery(
    `MATCH (t:Topic {name:$topic})-[:HAS_CONCEPT]->(c:Concept)
     RETURN t, collect(c) AS concepts`,
    { topic: topicName }
  );
  if (!records.length) return null;
  const row = records[0];
  return {
    topic: row.get('t').properties,
    concepts: row.get('concepts').map((c) => c.properties),
  };
}

export async function getLearningPath(topicName) {
  const records = await runQuery(
    `MATCH path = (start:Topic {name:$topic})-[:REQUIRES*1..5]->(prereq:Topic)
     RETURN [node IN nodes(path) | node.name] AS path`,
    { topic: topicName }
  );
  return records.map((r) => r.get('path'));
}

export async function getStudentWeakAreas(uid) {
  const records = await runQuery(
    `MATCH (:Student {uid:$uid})-[:WEAK_AT]->(c:Concept)<-[:HAS_CONCEPT]-(t:Topic)
     RETURN t.name AS topic, collect(c.name) AS weak_concepts`,
    { uid }
  );
  return records.map((r) => ({
    topic: r.get('topic'),
    weakConcepts: r.get('weak_concepts'),
  }));
}

export async function saveStudyProgress(uid, topicName, score) {
  await runQuery(
    `MERGE (s:Student {uid:$uid})
     MERGE (t:Topic {name:$topic})
     MERGE (s)-[r:STUDIED]->(t)
     SET r.score = $score, r.lastStudied = datetime()`,
    { uid, topic: topicName, score }
  );
}

export async function markConceptMastery(uid, conceptName, mastered) {
  const rel = mastered ? 'MASTERED' : 'WEAK_AT';
  const opposite = mastered ? 'WEAK_AT' : 'MASTERED';
  await runQuery(
    `MERGE (s:Student {uid:$uid})
     MATCH (c:Concept {name:$concept})
     MERGE (s)-[:${rel}]->(c)
     WITH s, c
     OPTIONAL MATCH (s)-[r:${opposite}]->(c)
     DELETE r`,
    { uid, concept: conceptName }
  );
}

export async function getRecommendedTopics(uid) {
  const records = await runQuery(
    `MATCH (s:Student {uid:$uid})-[:STUDIED]->(done:Topic)<-[:REQUIRES]-(next:Topic)
     WHERE NOT (s)-[:STUDIED]->(next)
     RETURN next.name AS name, next.difficulty AS difficulty LIMIT 3`,
    { uid }
  );
  return records.map((r) => ({
    name: r.get('name'),
    difficulty: r.get('difficulty'),
  }));
}

export async function getStudyProgress(uid) {
  const records = await runQuery(
    `MATCH (s:Student {uid:$uid})-[r:STUDIED]->(t:Topic)<-[:HAS_TOPIC]-(sub:Subject)
     RETURN sub.name AS subject, t.name AS topic, r.score AS score, r.lastStudied AS lastStudied
     ORDER BY r.lastStudied DESC`,
    { uid }
  );
  return records.map((r) => ({
    subject: r.get('subject'),
    topic: r.get('topic'),
    score: r.get('score'),
    lastStudied: r.get('lastStudied'),
  }));
}

export async function getAllSubjectsWithTopics() {
  const records = await runQuery(
    `MATCH (s:Subject)-[:HAS_TOPIC]->(t:Topic)
     RETURN s.name AS subject, s.icon AS icon, s.color AS color,
            collect({name: t.name, difficulty: t.difficulty}) AS topics
     ORDER BY s.name`
  );
  return records.map((r) => ({
    name: r.get('subject'),
    icon: r.get('icon'),
    color: r.get('color'),
    topics: r.get('topics').map((t) => t),
  }));
}

export async function getConceptGraphForViz(topicName, uid = null) {
  const records = await runQuery(
    `MATCH (t:Topic {name:$topic})-[:HAS_CONCEPT]->(c:Concept)
     OPTIONAL MATCH (s:Student {uid:$uid})-[m:MASTERED]->(c)
     OPTIONAL MATCH (s2:Student {uid:$uid})-[w:WEAK_AT]->(c)
     RETURN c.name AS name, c.definition AS definition,
            CASE WHEN m IS NOT NULL THEN 'mastered'
                 WHEN w IS NOT NULL THEN 'weak'
                 ELSE 'unstudied' END AS status`,
    { topic: topicName, uid: uid || '' }
  );
  return records.map((r) => ({
    name: r.get('name'),
    definition: r.get('definition'),
    status: r.get('status'),
  }));
}
