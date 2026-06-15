import { CONCEPT_DEFINITIONS, ConceptDefinition } from "../data/concepts";

// Keywords dictionary for matching text questions
const CONCEPT_KEYWORDS: Record<string, string[]> = {
  "states-of-matter": ["solid", "liquid", "gas", "plasma", "states of matter", "matter state"],
  "chemistry-foundations": ["chemistry", "chemical", "h2o", "water formula", "formula", "compound", "reaction", "element", "carbon dioxide", "oxygen", "nacl"],
  "photosynthesis": ["photosynthesis", "sunlight", "chlorophyll", "plants make food", "food process in plants"],
  "plant-biology": ["transpiration", "root", "stem", "seed", "germination", "leaves", "flower", "plant biology", "zoology"],
  "human-anatomy": ["anatomy", "organ", "heart", "liver", "skin", "brain", "lung", "organs"],
  "space-astronomy": ["planet", "venus", "mars", "saturn", "jupiter", "star", "sun", "galaxy", "astronomy", "space"],
  "physics-foundations": ["gravity", "newton", "velocity", "force", "energy", "conservation of energy", "primary color", "red", "blue", "green", "physics"],
  "algebra-foundations": ["algebra", "equation", "variable", "expression", "linear equation", "x and y", "square root", "144"],
  "quadratic-equations": ["quadratic", "roots", "second degree", "discriminant", "parabola", "factoring"],
  "basic-geometry": ["geometry", "angle", "triangle", "square", "rectangle", "polygon", "right-angled"],
  "advanced-geometry": ["circle", "pi", "radius", "diameter", "pythagorean", "hypotenuse", "trigonometry", "sine", "cosine", "a2 + b2"],
  "grammar-syntax": ["grammar", "parts of speech", "noun", "pronoun", "verb", "adjective", "adverb", "preposition", "conjunction", "simile", "metaphor"],
  "literature": ["literature", "romeo", "juliet", "shakespeare", "play", "author", "writer", "poem", "drama", "novel", "dickens", "austen"],
  "geography-rivers": ["river", "krishna", "godavari", "pennar", "dam", "irrigation", "geography"],
  "art-culture": ["kalamkari", "art", "culture", "temple", "landmark", "tirupati", "venkateswara", "festivals", "ugadi", "sankranti"],
  "telangana-history": ["telangana", "bathukamma", "bonalu", "hyderabad", "state bird", "palapitta", "kaleshwaram", "irrigation project in telangana", "statehood"],
  "ap-history": ["andhra pradesh", "crop", "rice", "chief minister", "blackbuck", "jinka", "parakeet", "sanjiva reddy"],
  "indian-history": ["india", "prime minister", "nehru", "capital of india", "delhi", "constitution", "independence", "gandhi", "rights", "democracy", "dictatorship"]
};

/**
 * Detect concept from user text question
 */
export function detectConceptFromText(text: string): ConceptDefinition | null {
  if (!text) return null;
  const lowerText = text.toLowerCase();

  let bestMatch: ConceptDefinition | null = null;
  let maxMatches = 0;

  for (const def of CONCEPT_DEFINITIONS) {
    const keywords = CONCEPT_KEYWORDS[def.id] || [];
    let matchCount = 0;

    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        // Multi-word matches get higher weight
        const weight = keyword.split(" ").length;
        matchCount += weight;
      }
    }

    // Direct concept name match gets high weight
    if (lowerText.includes(def.name.toLowerCase())) {
      matchCount += 5;
    }

    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      bestMatch = def;
    }
  }

  return bestMatch;
}

/**
 * Maps a quiz topic and text to a concept ID
 */
export function tagQuizTopicToConcept(topic: string, questionText: string = ""): string | null {
  if (!topic) return null;
  const lowerTopic = topic.toLowerCase();

  // Try direct keyword matching on topic
  for (const def of CONCEPT_DEFINITIONS) {
    if (def.name.toLowerCase() === lowerTopic || lowerTopic.includes(def.name.toLowerCase())) {
      return def.id;
    }
    const keywords = CONCEPT_KEYWORDS[def.id] || [];
    if (keywords.includes(lowerTopic)) {
      return def.id;
    }
  }

  // Fallback to searching inside question text
  const detected = detectConceptFromText(topic + " " + questionText);
  return detected ? detected.id : null;
}

/**
 * Maps a flashcard front text/subject to a concept ID
 */
export function tagFlashcardToConcept(front: string, subject: string): string | null {
  const detected = detectConceptFromText(front);
  if (detected) return detected.id;

  // Fallback map based on subject default
  const fallbackSubjectMap: Record<string, string> = {
    "Science": "states-of-matter",
    "Math": "algebra-foundations",
    "English": "grammar-syntax",
    "Social Studies": "indian-history",
  };

  return fallbackSubjectMap[subject] || "states-of-matter";
}
