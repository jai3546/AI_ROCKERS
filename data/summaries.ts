// Study summaries organized by syllabus and lessons
export interface StudySummary {
  id: string
  title: string
  content: string
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
  lesson?: string // Lesson or chapter name
  unit?: string // Unit or module name
  grade?: number // Grade or class level
}

// General summaries that apply to all syllabi
const generalSummaries: StudySummary[] = [
  {
    id: "gen-sci-1",
    title: "Photosynthesis Process",
    content: "Photosynthesis is the process by which green plants, algae, and certain bacteria convert light energy, usually from the sun, into chemical energy in the form of glucose or other sugars. The process primarily takes place in the chloroplasts of plant cells, specifically using the green pigment chlorophyll. The basic equation for photosynthesis is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This process is essential for life on Earth as it produces oxygen and serves as the primary source of energy for most ecosystems.",
    subject: "Science",
    syllabus: "General"
  },
  {
    id: "gen-sci-2",
    title: "States of Matter",
    content: "Matter exists in three primary states: solid, liquid, and gas. In solids, particles are tightly packed in a regular pattern, have strong intermolecular forces, maintain a fixed shape and volume, and vibrate in place. In liquids, particles are close together but can move around each other, have moderate intermolecular forces, take the shape of their container while maintaining volume, and flow freely. In gases, particles are far apart with weak intermolecular forces, take both the shape and volume of their container, and move rapidly in all directions. A fourth state, plasma, consists of charged particles and is found in stars and lightning.",
    subject: "Science",
    syllabus: "General"
  },
  {
    id: "gen-math-1",
    title: "Circle Geometry Fundamentals",
    content: "A circle is a set of points in a plane that are equidistant from a fixed point called the center. Key properties include: radius (r) - the distance from the center to any point on the circle; diameter (d) - a line segment passing through the center connecting two points on the circle (d = 2r); circumference - the distance around the circle (C = 2πr); area - the space enclosed by the circle (A = πr²). Pi (π) is the ratio of a circle's circumference to its diameter, approximately 3.14159. Other important elements include chords, arcs, sectors, and segments.",
    subject: "Math",
    syllabus: "General"
  },
  {
    id: "gen-math-2",
    title: "Pythagorean Theorem",
    content: "The Pythagorean theorem states that in a right-angled triangle, the square of the length of the hypotenuse (the side opposite the right angle) equals the sum of the squares of the other two sides. If a and b are the lengths of the two legs, and c is the length of the hypotenuse, then a² + b² = c². This fundamental theorem has numerous applications in mathematics, physics, engineering, and everyday life, such as calculating distances, determining right angles, and solving problems involving triangles.",
    subject: "Math",
    syllabus: "General"
  },
  {
    id: "gen-eng-1",
    title: "Parts of Speech",
    content: "The English language has eight main parts of speech: 1) Nouns - name people, places, things, or ideas; 2) Pronouns - replace nouns to avoid repetition; 3) Verbs - express actions, states, or occurrences; 4) Adjectives - describe or modify nouns; 5) Adverbs - modify verbs, adjectives, or other adverbs; 6) Prepositions - show relationships between words in a sentence; 7) Conjunctions - connect words, phrases, or clauses; 8) Interjections - express strong emotions or reactions. Understanding these parts of speech is essential for constructing grammatically correct sentences and communicating effectively.",
    subject: "English",
    syllabus: "General"
  }
];

// AP (Andhra Pradesh) syllabus summaries
const apSummaries: StudySummary[] = [
  {
    id: "ap-ss-1",
    title: "Major Rivers of Andhra Pradesh",
    content: "Andhra Pradesh is blessed with several major rivers that are vital to the state's agriculture, economy, and culture. The Godavari, known as the 'Dakshin Ganga,' is the largest river flowing through the state, forming a fertile delta before emptying into the Bay of Bengal. The Krishna River is the second-largest, also forming a productive delta region. Other significant rivers include the Pennar (Penneru), which flows through Rayalaseema; the Vamsadhara, which forms part of the border with Odisha; and the Nagavali (Langulya), which also originates in Odisha and flows through northern Andhra Pradesh.",
    subject: "Social Studies",
    syllabus: "AP"
  },
  {
    id: "ap-sci-1",
    title: "Flora and Fauna of Andhra Pradesh",
    content: "Andhra Pradesh has rich biodiversity with several iconic species. The state animal is the Blackbuck (Krishna Jinka), an antelope species known for its distinctive spiral horns and ability to run at high speeds. The state bird is the Rose-ringed parakeet (Rama Chiluka), recognized by its bright green plumage and red beak. The state flower is Jasmine (Chamanti), valued for its fragrance and cultural significance. The Eastern Ghats, running through the state, host diverse ecosystems including deciduous forests, while the coastal regions support mangroves and marine life.",
    subject: "Science",
    syllabus: "AP"
  },
  {
    id: "ap-ss-2",
    title: "Agricultural Patterns in Andhra Pradesh",
    content: "Agriculture is the backbone of Andhra Pradesh's economy, with over 60% of the population dependent on it. The state is known as the 'Rice Bowl of India' due to its extensive rice cultivation, particularly in the Godavari and Krishna deltas. Other major crops include sugarcane, predominantly grown in the coastal districts; cotton, especially in the Telangana region; tobacco, with AP being India's leading producer; chillies, particularly the famous Guntur chillies; and various fruits like mangoes and bananas. The state's diverse climate and soil conditions support this agricultural variety, with irrigation from rivers and canals playing a crucial role.",
    subject: "Social Studies",
    syllabus: "AP"
  }
];

// Telangana syllabus summaries
const telanganaSummaries: StudySummary[] = [
  {
    id: "ts-sci-1",
    title: "Telangana State Symbols",
    content: "Telangana, India's youngest state, has adopted several state symbols that reflect its unique identity and heritage. The state animal is the Spotted Deer (Jinka), commonly found in the forests of Telangana. The Indian Roller (Palapitta) serves as the state bird, recognized by its bright blue plumage and cultural significance during festivals like Dussehra. The state flower is Tangidi Puvvu (Senna auriculata), a yellow flower used in traditional medicine and religious ceremonies. The state tree is Jammi Chettu (Prosopis cineraria), which holds cultural importance during the Dussehra festival.",
    subject: "Science",
    syllabus: "Telangana"
  },
  {
    id: "ts-ss-1",
    title: "Cultural Festivals of Telangana",
    content: "Telangana has a rich cultural heritage expressed through its unique festivals. Bathukamma is the state's most distinctive festival, celebrated predominantly by women who create elaborate floral arrangements and perform dances around them. Bonalu is another important festival honoring the goddess Mahakali, featuring processions and offerings of food. The state also celebrates pan-Indian festivals with local variations, including Dussehra, which has special significance with the Jammi tree; Diwali, the festival of lights; and Sankranti, the harvest festival marked by colorful rangoli designs and flying kites.",
    subject: "Social Studies",
    syllabus: "Telangana"
  },
  {
    id: "ts-ss-2",
    title: "Historical Monuments of Telangana",
    content: "Telangana boasts a rich architectural heritage with monuments spanning various historical periods. The Golconda Fort near Hyderabad is one of the most impressive, known for its acoustic features and diamond mining history. The Charminar, built in 1591, is Hyderabad's iconic symbol with its four minarets and mosque. The Warangal Fort showcases the artistic excellence of the Kakatiya dynasty with its intricate stone carvings. The Thousand Pillar Temple in Hanamkonda exemplifies the Chalukyan style of architecture. The Ramappa Temple, recently designated as a UNESCO World Heritage site, features floating bricks and intricate carvings from the 13th century.",
    subject: "Social Studies",
    syllabus: "Telangana"
  }
];

// CBSE syllabus summaries
const cbseSummaries: StudySummary[] = [
  {
    id: "cbse-sci-1",
    title: "Physical vs. Chemical Changes",
    content: "Changes in matter can be classified as either physical or chemical. Physical changes alter the appearance or state of a substance without changing its chemical composition. Examples include changes in state (melting, freezing, evaporation), dissolving, and physical deformation. These changes are usually reversible. Chemical changes, on the other hand, involve the formation of new substances with different properties and chemical compositions. Indicators of chemical changes include color change, gas production, precipitation formation, temperature change, and light emission. Examples include combustion, rusting, and cooking. Chemical changes are generally irreversible through physical means.",
    subject: "Science",
    syllabus: "CBSE"
  },
  {
    id: "cbse-ss-1",
    title: "Fundamental Rights in the Indian Constitution",
    content: "The Indian Constitution guarantees six Fundamental Rights to all citizens: 1) Right to Equality (Articles 14-18) ensures equality before law and prohibits discrimination; 2) Right to Freedom (Articles 19-22) includes freedom of speech, assembly, movement, and personal liberty; 3) Right against Exploitation (Articles 23-24) prohibits human trafficking and child labor; 4) Right to Freedom of Religion (Articles 25-28) ensures religious freedom and secular governance; 5) Cultural and Educational Rights (Articles 29-30) protect minorities and their educational institutions; 6) Right to Constitutional Remedies (Article 32) allows citizens to seek judicial enforcement of these rights through writs like habeas corpus, mandamus, prohibition, certiorari, and quo warranto.",
    subject: "Social Studies",
    syllabus: "CBSE"
  },
  {
    id: "cbse-eng-1",
    title: "Literary Devices: Metaphors and Similes",
    content: "Metaphors and similes are figurative language devices that create comparisons between different things. A simile makes an explicit comparison using 'like' or 'as' (e.g., 'Her smile is like sunshine' or 'He runs as fast as the wind'). This creates a clear relationship between the subject and the comparison. A metaphor, however, makes an implicit comparison by directly stating that one thing is another (e.g., 'Her smile is sunshine' or 'He is a cheetah on the track'). Metaphors create a stronger, more immediate impact by asserting equivalence rather than similarity. Both devices enrich language by adding imagery, emotion, and depth to descriptions.",
    subject: "English",
    syllabus: "CBSE"
  },
  {
    id: "cbse-sci-2",
    title: "Law of Conservation of Energy",
    content: "The Law of Conservation of Energy is a fundamental principle of physics stating that energy can neither be created nor destroyed; it can only be transferred or converted from one form to another. The total energy in an isolated system remains constant over time. For example, when a ball falls, its potential energy converts to kinetic energy; when fuel burns, chemical energy transforms into heat and light; in a hydroelectric dam, gravitational potential energy of water becomes electrical energy. This law is the foundation of thermodynamics and explains why perpetual motion machines are impossible. It applies to all energy forms including mechanical, thermal, chemical, electrical, nuclear, and radiant energy.",
    subject: "Science",
    syllabus: "CBSE"
  },
  {
    id: "cbse-ss-2",
    title: "Democracy vs. Dictatorship",
    content: "Democracy and dictatorship represent contrasting systems of governance. In a democracy, power is held by citizens who exercise it directly or through elected representatives. Key features include free and fair elections, majority rule with minority rights, constitutional government, and civil liberties. Examples include India, the United States, and most European nations. In a dictatorship, power is concentrated in the hands of an individual or small group who rule without the consent of the governed. Characteristics include suppression of opposition, controlled media, limited civil liberties, and often personality cults. Historical examples include Nazi Germany under Hitler, the Soviet Union under Stalin, and North Korea under the Kim dynasty. While democracies prioritize individual rights and collective decision-making, dictatorships emphasize centralized authority and often claim to provide stability and efficiency.",
    subject: "Social Studies",
    syllabus: "CBSE"
  }
];

// Combine all summaries
export const allSummaries: StudySummary[] = [
  ...generalSummaries,
  ...apSummaries,
  ...telanganaSummaries,
  ...cbseSummaries
];
