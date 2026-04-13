// Quiz questions organized by syllabus
export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  points: number
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
}

// General questions that apply to all syllabi
const generalQuestions: QuizQuestion[] = [
  {
    id: "gen1",
    question: "What is the process by which plants make their own food using sunlight?",
    options: [
      { id: "a", text: "Respiration", isCorrect: false },
      { id: "b", text: "Photosynthesis", isCorrect: true },
      { id: "c", text: "Transpiration", isCorrect: false },
      { id: "d", text: "Germination", isCorrect: false },
    ],
    points: 20,
    subject: "Science",
    syllabus: "General"
  },
  {
    id: "gen2",
    question: "Which planet is known as the Red Planet?",
    options: [
      { id: "a", text: "Venus", isCorrect: false },
      { id: "b", text: "Jupiter", isCorrect: false },
      { id: "c", text: "Mars", isCorrect: true },
      { id: "d", text: "Saturn", isCorrect: false },
    ],
    points: 15,
    subject: "Science",
    syllabus: "General"
  },
  {
    id: "gen3",
    question: "What is the largest organ in the human body?",
    options: [
      { id: "a", text: "Heart", isCorrect: false },
      { id: "b", text: "Liver", isCorrect: false },
      { id: "c", text: "Skin", isCorrect: true },
      { id: "d", text: "Brain", isCorrect: false },
    ],
    points: 20,
    subject: "Science",
    syllabus: "General"
  },
  {
    id: "gen4",
    question: "What is the value of π (pi) to two decimal places?",
    options: [
      { id: "a", text: "3.14", isCorrect: true },
      { id: "b", text: "3.41", isCorrect: false },
      { id: "c", text: "3.12", isCorrect: false },
      { id: "d", text: "3.16", isCorrect: false },
    ],
    points: 15,
    subject: "Math",
    syllabus: "General"
  },
  {
    id: "gen5",
    question: "Who wrote 'Romeo and Juliet'?",
    options: [
      { id: "a", text: "Charles Dickens", isCorrect: false },
      { id: "b", text: "William Shakespeare", isCorrect: true },
      { id: "c", text: "Jane Austen", isCorrect: false },
      { id: "d", text: "Mark Twain", isCorrect: false },
    ],
    points: 20,
    subject: "English",
    syllabus: "General"
  }
];

// AP (Andhra Pradesh) syllabus questions
const apQuestions: QuizQuestion[] = [
  {
    id: "ap1",
    question: "Which river forms the boundary between Andhra Pradesh and Telangana?",
    options: [
      { id: "a", text: "Godavari", isCorrect: false },
      { id: "b", text: "Krishna", isCorrect: true },
      { id: "c", text: "Pennar", isCorrect: false },
      { id: "d", text: "Tungabhadra", isCorrect: false },
    ],
    points: 25,
    subject: "Social Studies",
    syllabus: "AP"
  },
  {
    id: "ap2",
    question: "Which district in Andhra Pradesh is famous for its Kalamkari art?",
    options: [
      { id: "a", text: "Visakhapatnam", isCorrect: false },
      { id: "b", text: "Nellore", isCorrect: false },
      { id: "c", text: "Sri Potti Sriramulu Nellore", isCorrect: false },
      { id: "d", text: "Chittoor", isCorrect: true },
    ],
    points: 20,
    subject: "Social Studies",
    syllabus: "AP"
  },
  {
    id: "ap3",
    question: "Which famous temple is located in Tirupati, Andhra Pradesh?",
    options: [
      { id: "a", text: "Kanaka Durga Temple", isCorrect: false },
      { id: "b", text: "Sri Venkateswara Temple", isCorrect: true },
      { id: "c", text: "Mallikarjuna Temple", isCorrect: false },
      { id: "d", text: "Simhachalam Temple", isCorrect: false },
    ],
    points: 15,
    subject: "Social Studies",
    syllabus: "AP"
  },
  {
    id: "ap4",
    question: "Which crop is Andhra Pradesh the largest producer of in India?",
    options: [
      { id: "a", text: "Rice", isCorrect: true },
      { id: "b", text: "Wheat", isCorrect: false },
      { id: "c", text: "Sugarcane", isCorrect: false },
      { id: "d", text: "Cotton", isCorrect: false },
    ],
    points: 20,
    subject: "Science",
    syllabus: "AP"
  },
  {
    id: "ap5",
    question: "Who was the first Chief Minister of Andhra Pradesh after its formation in 1956?",
    options: [
      { id: "a", text: "N. T. Rama Rao", isCorrect: false },
      { id: "b", text: "Kasu Brahmananda Reddy", isCorrect: false },
      { id: "c", text: "Neelam Sanjiva Reddy", isCorrect: true },
      { id: "d", text: "Damodaram Sanjivayya", isCorrect: false },
    ],
    points: 25,
    subject: "Social Studies",
    syllabus: "AP"
  }
];

// Telangana syllabus questions
const telanganaQuestions: QuizQuestion[] = [
  {
    id: "ts1",
    question: "When was Telangana officially formed as a separate state?",
    options: [
      { id: "a", text: "June 2, 2014", isCorrect: true },
      { id: "b", text: "June 2, 2013", isCorrect: false },
      { id: "c", text: "June 2, 2015", isCorrect: false },
      { id: "d", text: "June 2, 2012", isCorrect: false },
    ],
    points: 25,
    subject: "Social Studies",
    syllabus: "Telangana"
  },
  {
    id: "ts2",
    question: "Which is the state bird of Telangana?",
    options: [
      { id: "a", text: "Indian Roller (Palapitta)", isCorrect: true },
      { id: "b", text: "Peacock", isCorrect: false },
      { id: "c", text: "Sparrow", isCorrect: false },
      { id: "d", text: "Flamingo", isCorrect: false },
    ],
    points: 15,
    subject: "Science",
    syllabus: "Telangana"
  },
  {
    id: "ts3",
    question: "Which festival is celebrated as the state festival of Telangana?",
    options: [
      { id: "a", text: "Diwali", isCorrect: false },
      { id: "b", text: "Bathukamma", isCorrect: true },
      { id: "c", text: "Sankranti", isCorrect: false },
      { id: "d", text: "Ugadi", isCorrect: false },
    ],
    points: 20,
    subject: "Social Studies",
    syllabus: "Telangana"
  },
  {
    id: "ts4",
    question: "Which major irrigation project is built across the Godavari River in Telangana?",
    options: [
      { id: "a", text: "Nagarjuna Sagar", isCorrect: false },
      { id: "b", text: "Srisailam", isCorrect: false },
      { id: "c", text: "Kaleshwaram", isCorrect: true },
      { id: "d", text: "Jurala", isCorrect: false },
    ],
    points: 25,
    subject: "Social Studies",
    syllabus: "Telangana"
  },
  {
    id: "ts5",
    question: "Which city is known as the 'City of Pearls' in Telangana?",
    options: [
      { id: "a", text: "Warangal", isCorrect: false },
      { id: "b", text: "Nizamabad", isCorrect: false },
      { id: "c", text: "Karimnagar", isCorrect: false },
      { id: "d", text: "Hyderabad", isCorrect: true },
    ],
    points: 15,
    subject: "Social Studies",
    syllabus: "Telangana"
  }
];

// CBSE syllabus questions
const cbseQuestions: QuizQuestion[] = [
  {
    id: "cbse1",
    question: "What is the chemical formula for water?",
    options: [
      { id: "a", text: "H2O", isCorrect: true },
      { id: "b", text: "CO2", isCorrect: false },
      { id: "c", text: "NaCl", isCorrect: false },
      { id: "d", text: "H2O2", isCorrect: false },
    ],
    points: 15,
    subject: "Science",
    syllabus: "CBSE"
  },
  {
    id: "cbse2",
    question: "Who was the first Prime Minister of India?",
    options: [
      { id: "a", text: "Mahatma Gandhi", isCorrect: false },
      { id: "b", text: "Jawaharlal Nehru", isCorrect: true },
      { id: "c", text: "Sardar Vallabhbhai Patel", isCorrect: false },
      { id: "d", text: "Dr. B.R. Ambedkar", isCorrect: false },
    ],
    points: 20,
    subject: "Social Studies",
    syllabus: "CBSE"
  },
  {
    id: "cbse3",
    question: "What is the square root of 144?",
    options: [
      { id: "a", text: "12", isCorrect: true },
      { id: "b", text: "14", isCorrect: false },
      { id: "c", text: "10", isCorrect: false },
      { id: "d", text: "16", isCorrect: false },
    ],
    points: 15,
    subject: "Math",
    syllabus: "CBSE"
  },
  {
    id: "cbse4",
    question: "Which of the following is not a primary color?",
    options: [
      { id: "a", text: "Red", isCorrect: false },
      { id: "b", text: "Blue", isCorrect: false },
      { id: "c", text: "Green", isCorrect: false },
      { id: "d", text: "Yellow", isCorrect: true },
    ],
    points: 20,
    subject: "Science",
    syllabus: "CBSE"
  },
  {
    id: "cbse5",
    question: "What is the capital of India?",
    options: [
      { id: "a", text: "Mumbai", isCorrect: false },
      { id: "b", text: "Kolkata", isCorrect: false },
      { id: "c", text: "New Delhi", isCorrect: true },
      { id: "d", text: "Chennai", isCorrect: false },
    ],
    points: 15,
    subject: "Social Studies",
    syllabus: "CBSE"
  }
];

// Combine all questions
export const allQuizQuestions: QuizQuestion[] = [
  ...generalQuestions,
  ...apQuestions,
  ...telanganaQuestions,
  ...cbseQuestions
];
