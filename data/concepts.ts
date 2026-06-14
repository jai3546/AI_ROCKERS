export interface ConceptDefinition {
  id: string;
  name: string;
  subject: string;
  description: string;
  prerequisites: string[];
}

export const CONCEPT_DEFINITIONS: ConceptDefinition[] = [
  // Science Concepts
  {
    id: "states-of-matter",
    name: "States of Matter",
    subject: "Science",
    description: "Foundational understanding of solids, liquids, gases, and plasma states.",
    prerequisites: []
  },
  {
    id: "chemistry-foundations",
    name: "Chemistry Foundations",
    subject: "Science",
    description: "Chemical formulas, reactions, and properties of substances like water.",
    prerequisites: ["states-of-matter"]
  },
  {
    id: "photosynthesis",
    name: "Photosynthesis",
    subject: "Science",
    description: "The process by which plants use sunlight, carbon dioxide, and water to synthesize food.",
    prerequisites: []
  },
  {
    id: "plant-biology",
    name: "Plant Biology",
    subject: "Science",
    description: "Advanced plant structures, transpiration, respiration, and growth systems.",
    prerequisites: ["photosynthesis"]
  },
  {
    id: "human-anatomy",
    name: "Human Anatomy",
    subject: "Science",
    description: "Major organs, systems, and physiological processes in the human body.",
    prerequisites: []
  },
  {
    id: "space-astronomy",
    name: "Space & Astronomy",
    subject: "Science",
    description: "Planets, solar systems, stars, and cosmological structures.",
    prerequisites: []
  },
  {
    id: "physics-foundations",
    name: "Physics Foundations",
    subject: "Science",
    description: "Newtonian mechanics, gravity, light, energy conservation, and basic forces.",
    prerequisites: []
  },

  // Math Concepts
  {
    id: "algebra-foundations",
    name: "Algebra Foundations",
    subject: "Math",
    description: "Variables, algebraic expressions, linear equations, and basic operations.",
    prerequisites: []
  },
  {
    id: "quadratic-equations",
    name: "Quadratic Equations",
    subject: "Math",
    description: "Solving equations of second degree, roots, factoring, and discriminant analysis.",
    prerequisites: ["algebra-foundations"]
  },
  {
    id: "basic-geometry",
    name: "Basic Geometry",
    subject: "Math",
    description: "Shapes, angles, perimeter, and foundational properties of polygons.",
    prerequisites: []
  },
  {
    id: "advanced-geometry",
    name: "Advanced Geometry",
    subject: "Math",
    description: "Circle theorems, area calculations (pi), and trigonometry relations.",
    prerequisites: ["basic-geometry"]
  },

  // English Concepts
  {
    id: "grammar-syntax",
    name: "Grammar & Syntax",
    subject: "English",
    description: "Parts of speech, sentence building, similes, metaphors, and language structure.",
    prerequisites: []
  },
  {
    id: "literature",
    name: "Literature",
    subject: "English",
    description: "Analysis of classical drama, Shakespearean works, poems, and themes.",
    prerequisites: ["grammar-syntax"]
  },

  // Social Studies Concepts
  {
    id: "geography-rivers",
    name: "Geography & Rivers",
    subject: "Social Studies",
    description: "River systems, physical geographies, dams, and land divisions in India.",
    prerequisites: []
  },
  {
    id: "art-culture",
    name: "Art & Culture",
    subject: "Social Studies",
    description: "Traditional art forms like Kalamkari, dance forms, temples, and landmarks.",
    prerequisites: []
  },
  {
    id: "telangana-history",
    name: "Telangana History",
    subject: "Social Studies",
    description: "The history of Telangana, its statehood formation, culture, and major irrigation projects.",
    prerequisites: []
  },
  {
    id: "ap-history",
    name: "AP History",
    subject: "Social Studies",
    description: "History of Andhra Pradesh, landmarks, agricultural systems, and political developments.",
    prerequisites: []
  },
  {
    id: "indian-history",
    name: "Indian History",
    subject: "Social Studies",
    description: "Indian independence movement, prime ministers, constitution, and democratic systems.",
    prerequisites: []
  }
];
