// Flashcards organized by syllabus
export interface Flashcard {
  id: string
  front: string
  back: string
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
}

// General flashcards that apply to all syllabi
const generalFlashcards: Flashcard[] = [
  {
    id: "gen1",
    front: "What is photosynthesis?",
    back: "The process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water, generating oxygen as a byproduct.",
    subject: "Science",
    syllabus: "General"
  },
  {
    id: "gen2",
    front: "What are the three states of matter?",
    back: "Solid, liquid, and gas. Some scientists also include plasma as a fourth state.",
    subject: "Science",
    syllabus: "General"
  },
  {
    id: "gen3",
    front: "What is the formula for the area of a circle?",
    back: "A = πr², where r is the radius of the circle.",
    subject: "Math",
    syllabus: "General"
  },
  {
    id: "gen4",
    front: "What is the Pythagorean theorem?",
    back: "In a right-angled triangle, the square of the length of the hypotenuse equals the sum of the squares of the other two sides. a² + b² = c²",
    subject: "Math",
    syllabus: "General"
  },
  {
    id: "gen5",
    front: "What are the parts of speech in English?",
    back: "Noun, pronoun, verb, adjective, adverb, preposition, conjunction, and interjection.",
    subject: "English",
    syllabus: "General"
  }
];

// AP (Andhra Pradesh) syllabus flashcards
const apFlashcards: Flashcard[] = [
  {
    id: "ap1",
    front: "What are the major rivers in Andhra Pradesh?",
    back: "Godavari, Krishna, Pennar, Vamsadhara, and Nagavali.",
    subject: "Social Studies",
    syllabus: "AP"
  },
  {
    id: "ap2",
    front: "What is the state animal of Andhra Pradesh?",
    back: "Blackbuck (Krishna Jinka)",
    subject: "Science",
    syllabus: "AP"
  },
  {
    id: "ap3",
    front: "What is the state bird of Andhra Pradesh?",
    back: "Rose-ringed parakeet (Rama Chiluka)",
    subject: "Science",
    syllabus: "AP"
  },
  {
    id: "ap4",
    front: "What is the state flower of Andhra Pradesh?",
    back: "Jasmine (Chamanti)",
    subject: "Science",
    syllabus: "AP"
  },
  {
    id: "ap5",
    front: "What are the major crops grown in Andhra Pradesh?",
    back: "Rice, sugarcane, cotton, tobacco, chillies, and various fruits.",
    subject: "Social Studies",
    syllabus: "AP"
  }
];

// Telangana syllabus flashcards
const telanganaFlashcards: Flashcard[] = [
  {
    id: "ts1",
    front: "What is the state animal of Telangana?",
    back: "Spotted Deer (Jinka)",
    subject: "Science",
    syllabus: "Telangana"
  },
  {
    id: "ts2",
    front: "What is the state bird of Telangana?",
    back: "Indian Roller (Palapitta)",
    subject: "Science",
    syllabus: "Telangana"
  },
  {
    id: "ts3",
    front: "What is the state flower of Telangana?",
    back: "Tangidi Puvvu (Senna auriculata)",
    subject: "Science",
    syllabus: "Telangana"
  },
  {
    id: "ts4",
    front: "What is the state tree of Telangana?",
    back: "Jammi Chettu (Prosopis cineraria)",
    subject: "Science",
    syllabus: "Telangana"
  },
  {
    id: "ts5",
    front: "What are the major festivals celebrated in Telangana?",
    back: "Bathukamma, Bonalu, Dussehra, Diwali, and Sankranti.",
    subject: "Social Studies",
    syllabus: "Telangana"
  }
];

// CBSE syllabus flashcards
const cbseFlashcards: Flashcard[] = [
  {
    id: "cbse1",
    front: "What is the difference between physical and chemical changes?",
    back: "In a physical change, no new substance is formed and the change can be reversed. In a chemical change, a new substance is formed and the change usually cannot be reversed easily.",
    subject: "Science",
    syllabus: "CBSE"
  },
  {
    id: "cbse2",
    front: "What are the fundamental rights guaranteed by the Indian Constitution?",
    back: "Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies.",
    subject: "Social Studies",
    syllabus: "CBSE"
  },
  {
    id: "cbse3",
    front: "What is the difference between a metaphor and a simile?",
    back: "A simile compares two things using 'like' or 'as', while a metaphor directly states that one thing is another thing.",
    subject: "English",
    syllabus: "CBSE"
  },
  {
    id: "cbse4",
    front: "What is the law of conservation of energy?",
    back: "Energy can neither be created nor destroyed; it can only be transferred or changed from one form to another.",
    subject: "Science",
    syllabus: "CBSE"
  },
  {
    id: "cbse5",
    front: "What is the difference between democracy and dictatorship?",
    back: "In a democracy, power is held by the people through elected representatives. In a dictatorship, power is concentrated in the hands of one person or a small group.",
    subject: "Social Studies",
    syllabus: "CBSE"
  }
];

// Combine all flashcards
export const allFlashcards: Flashcard[] = [
  ...generalFlashcards,
  ...apFlashcards,
  ...telanganaFlashcards,
  ...cbseFlashcards
];
