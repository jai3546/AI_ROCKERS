/**
 * Gemini API Service
 * This service handles communication with the Google Gemini API
 */
import { LearningStyleProfile, generateLearningStylePrompt } from './learning-style-service';

// Define response type
interface GeminiResponse {
  text: string;
  error?: string;
}

// Define subject types
export type Subject = 'math' | 'science' | 'history' | 'english' | 'general';

// Define emotion type
export type EmotionState = {
  emotion: string;
  fatigueScore?: number;
  attentionScore?: number;
};
const userQueryCounters = new Map<string, number>();

export function resetUserQueryCount(userId: string) {
  userQueryCounters.delete(userId);
}

function getUserQueryCount(userId: string): number {
  return userQueryCounters.get(userId) || 0;
}

function incrementUserQueryCount(userId: string): number {
  const count = getUserQueryCount(userId) + 1;
  userQueryCounters.set(userId, count);
  return count;
}
/**
 * Send a prompt to the Gemini API and get a response
 * @param prompt The user's prompt/question
 * @param subject Optional subject context to help guide the response
 * @param language The language for the response (en, hi, te)
 * @param learningStyle Optional learning style profile for personalized content
 * @param emotionState Optional emotional state for empathetic responses
 * @returns Promise with the AI response
 */
export async function getGeminiResponse(
  prompt: string,
  subject: Subject = 'general',
  language: 'en' | 'hi' | 'te' = 'en',
  learningStyle?: LearningStyleProfile,
  emotionState?: EmotionState
): Promise<GeminiResponse> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Construct the API URL for Gemini 2.5 Flash-Lite model (optimized for speed and higher quota limits)
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

    // Create a system prompt based on subject and language
    let systemPrompt = `You are an educational AI tutor specializing in ${subject}. `;

    // Add language instruction
    if (language === 'hi') {
      systemPrompt += 'Please respond in Hindi.';
    } else if (language === 'te') {
      systemPrompt += 'Please respond in Telugu.';
    } else {
      systemPrompt += 'Please respond in English.';
    }

    // Add educational context
    systemPrompt += ` Your goal is to help students learn ${subject} concepts in a clear,
    engaging way. Provide explanations that are appropriate for K-12 students.`;

    // Add learning style adaptations if available
    if (learningStyle) {
      systemPrompt += ` ${generateLearningStylePrompt(learningStyle, emotionState)}`;
    }

    // Add emotional response guidance if emotion is provided without learning style
    if (emotionState && !learningStyle) {
      systemPrompt += ` The student currently appears ${emotionState.emotion}.`;

      // Add empathetic response based on emotion
      switch(emotionState.emotion) {
        case 'sad':
          systemPrompt += ` Respond with empathy and encouragement. Use positive reinforcement and supportive language.`;
          break;
        case 'angry':
          systemPrompt += ` Acknowledge any frustration they might be feeling. Offer clear, patient explanations and alternative approaches.`;
          break;
        case 'fearful':
          systemPrompt += ` Provide reassurance and break down complex topics into manageable parts. Use a calm, supportive tone.`;
          break;
        case 'confused':
          systemPrompt += ` Offer simplified explanations and check for understanding frequently. Use analogies and examples.`;
          break;
        case 'happy':
          systemPrompt += ` Build on their positive mood with engaging content. Challenge them appropriately.`;
          break;
        case 'neutral':
          systemPrompt += ` Maintain an engaging and supportive tone.`;
          break;
      }

      // Add fatigue and attention considerations
      if (emotionState.fatigueScore !== undefined && emotionState.fatigueScore > 60) {
        systemPrompt += ` The student appears fatigued (${emotionState.fatigueScore}% fatigue detected). Keep explanations concise and consider suggesting breaks.`;
      }

      if (emotionState.attentionScore !== undefined) {
        if (emotionState.attentionScore < 40) {
          systemPrompt += ` Their attention level is low (${emotionState.attentionScore}%). Use engaging examples and shorter explanations.`;
        } else if (emotionState.attentionScore > 70) {
          systemPrompt += ` Their attention level is high (${emotionState.attentionScore}%). You can provide more detailed explanations.`;
        }
      }
    }

    // Prepare the request body for Gemini 1.5 Flash
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt + "\n\n" + prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,  // Lower temperature for more focused responses
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 4096,  // Increased token limit for more detailed responses
        responseMimeType: "text/plain",  // Ensure plain text responses
      }
    };

    // Make the API request
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from Gemini API');
    }

    const data = await response.json();

    // Extract the text from the response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return { text };
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return {
      text: 'I apologize, but I encountered an error processing your request.',
      error: error.message
    };
  }
}

/**
 * Fallback function when API is not available
 * @param prompt The user's prompt/question
 * @param subject Optional subject context
 * @param language The language for the response
 * @param learningStyle Optional learning style profile for personalized content
 * @param emotionState Optional emotional state for empathetic responses
 * @returns Mock response based on language and emotional state
 */


export async function getMockGeminiResponse(
  prompt: string,
  subject: Subject = 'general',
  language: 'en' | 'hi' | 'te' = 'en',
  learningStyle?: LearningStyleProfile,
  emotionState?: EmotionState,
  generalQueryCount: number = 0,
  userId?: string
): Promise<GeminiResponse & { newCount?: number }> {
  const emotionalResponses = {
    en: {
      sad: [
        "I notice you might be feeling down. Let me help you with that in a supportive way...",
        "It's okay to feel frustrated with difficult concepts. Let's work through this together..."
      ],
      angry: [
        "I understand this might be frustrating. Let's take a different approach that might work better for you...",
        "I can see this topic might be challenging. Let me explain it differently..."
      ],
      fearful: [
        "Don't worry, this concept is challenging for many students. Let's break it down into smaller parts...",
        "It's completely normal to feel uncertain about this topic. We'll take it step by step..."
      ],
      happy: [
        "I'm glad you're enthusiastic about learning! Let's explore this exciting concept together...",
        "Your positive energy is great! Let's channel that into mastering this concept..."
      ],
      neutral: [
        "I understand your question. Let me explain that in a simple way...",
        "That's a great question! Here's what you need to know...",
        "I can help with that. The concept works like this...",
        "Let me break this down step by step for you...",
      ]
    },
    hi: {
      sad: [
        "मुझे लगता है कि आप थोड़े उदास हैं। मैं आपकी सहायक तरीके से मदद करता हूँ...",
        "कठिन अवधारणाओं से निराश होना ठीक है। आइए इसे एक साथ हल करें..."
      ],
      angry: [
        "मैं समझता हूँ कि यह निराशाजनक हो सकता है। आइए एक अलग दृष्टिकोण अपनाएं जो आपके लिए बेहतर काम कर सकता है...",
        "मैं देख सकता हूँ कि यह विषय चुनौतीपूर्ण हो सकता है। मुझे इसे अलग तरीके से समझाने दें..."
      ],
      fearful: [
        "चिंता न करें, यह अवधारणा कई छात्रों के लिए चुनौतीपूर्ण है। आइए इसे छोटे भागों में विभाजित करें...",
        "इस विषय के बारे में अनिश्चित महसूस करना पूरी तरह से सामान्य है। हम इसे चरण दर चरण लेंगे..."
      ],
      happy: [
        "मुझे खुशी है कि आप सीखने के लिए उत्साहित हैं! आइए इस रोमांचक अवधारणा का एक साथ पता लगाएं...",
        "आपकी सकारात्मक ऊर्जा बहुत अच्छी है! आइए इस अवधारणा को मास्टर करने में उस ऊर्जा का उपयोग करें..."
      ],
      neutral: [
        "मैं आपके प्रश्न को समझता हूँ। मुझे इसे सरल तरीके से समझाने दें...",
        "यह एक बढ़िया सवाल है! आपको यह जानने की जरूरत है...",
        "मैं इसमें मदद कर सकता हूँ। अवधारणा इस प्रकार काम करती है...",
        "मुझे इसे आपके लिए चरण दर चरण समझाने दें...",
      ]
    },
    te: {
      sad: [
        "మీరు కొంచెం నిరాశగా ఉన్నట్లు నాకు అనిపిస్తోంది. నేను మీకు సహాయపడతాను...",
        "కష్టమైన భావనలతో నిరాశ చెందడం సహజం. దీన్ని కలిసి పరిష్కరిద్దాం..."
      ],
      angry: [
        "ఇది నిరాశపరిచే అవకాశం ఉందని నాకు అర్థమైంది. మీకు మెరుగ్గా పనిచేసే వేరే విధానాన్ని ప్రయత్నిద్దాం...",
        "ఈ అంశం సవాలుగా ఉండవచ్చని నేను చూడగలను. దీన్ని వేరే విధంగా వివరిస్తాను..."
      ],
      fearful: [
        "చింతించకండి, ఈ భావన చాలా మంది విద్యార్థులకు సవాలుగా ఉంటుంది. దీన్ని చిన్న భాగాలుగా విభజిద్దాం...",
        "ఈ అంశం గురించి అనిశ్చితంగా భావించడం పూర్తిగా సాధారణం. మనం దీన్ని అడుగు అడుగున తీసుకుంటాము..."
      ],
      happy: [
        "మీరు నేర్చుకోవడం పట్ల ఉత్సాహంగా ఉన్నందుకు నేను సంతోషిస్తున్నాను! ఈ ఆసక్తికరమైన భావనను కలిసి అన్వేషిద్దాం...",
        "మీ సానుకూల శక్తి చాలా బాగుంది! ఈ భావనను అధిగమించడానికి ఆ శక్తిని ఉపయోగిద్దాం..."
      ],
      neutral: [
        "మీ ప్రశ్నను నేను అర్థం చేసుకున్నాను. దాన్ని సరళమైన మార్గంలో వివరిస్తాను...",
        "అది చాలా మంచి ప్రశ్న! మీరు తెలుసుకోవలసినది ఇదే...",
        "నేను దానితో సహాయం చేయగలను. భావన ఇలా పని చేస్తుంది...",
        "నేను దీన్ని మీ కోసం దశలవారీగా విశ్లేషిస్తాను...",
      ]
    }
  };

  const learningStyleResponses = {
    en: {
      visual: "Let me explain this with a visual example you can imagine...",
      auditory: "If I were to explain this concept verbally, I would describe it as...",
      kinesthetic: "Think about this concept as something you can interact with physically..."
    },
    hi: {
      visual: "मैं इसे एक दृश्य उदाहरण के साथ समझाता हूँ जिसे आप कल्पना कर सकते हैं...",
      auditory: "अगर मैं इस अवधारणा को मौखिक रूप से समझाऊं, तो मैं इसे ऐसे वर्णित करूंगा...",
      kinesthetic: "इस अवधारणा के बारे में ऐसे सोचें जिससे आप शारीरिक रूप से बातचीत कर सकते हैं..."
    },
    te: {
      visual: "మీరు ఊహించుకోగలిగే దృశ్య ఉదాహరణతో దీన్ని వివరిస్తాను...",
      auditory: "నేను ఈ భావనను మౌఖికంగా వివరిస్తే, దాన్ని ఇలా వర్ణిస్తాను...",
      kinesthetic: "మీరు భౌతికంగా సంకర్షించగలిగే విషయంగా ఈ భావన గురించి ఆలోచించండి..."
    }
  };

  const lowerPrompt = prompt.toLowerCase().trim();
  const casualKeywords = ['hi', 'hello', 'hey', 'greetings', 'sup', 'yo', 'joke', 'fun fact', 'how are you'];
  const isCasual = casualKeywords.some(keyword => lowerPrompt.includes(keyword));
  const topicAnswers: Record<string, string> = {
    gravity: "Gravity is a fundamental force that pulls objects with mass toward each other. On Earth, it gives weight to objects and causes them to fall when dropped. Isaac Newton first described it mathematically — the force depends on the masses of two objects and the distance between them. Albert Einstein later redefined gravity through General Relativity, describing it as a curvature in space-time caused by mass. Without gravity, planets wouldn't orbit the sun, and life on Earth wouldn't exist.",

    photosynthesis: "Photosynthesis is the process by which plants, algae, and some bacteria convert sunlight into food. Using sunlight, water absorbed from roots, and carbon dioxide from the air, plants produce glucose and release oxygen as a byproduct. This happens inside chloroplasts — organelles found in plant cells — using a green pigment called chlorophyll. Photosynthesis is essential to life on Earth: it produces the oxygen we breathe and forms the foundation of nearly every food chain.",

    newton: "Sir Isaac Newton was an English mathematician, physicist, and astronomer born in 1643. He is best known for his three Laws of Motion and the Law of Universal Gravitation. His first law states that an object stays at rest or in motion unless acted upon by a force. His second law defines force as mass times acceleration (F=ma). His third law states that every action has an equal and opposite reaction. Newton also co-invented calculus and made major contributions to optics.",

    einstein: "Albert Einstein was a German-born physicist born in 1879, widely regarded as one of the greatest scientists of all time. He developed the Theory of Special Relativity, introducing the famous equation E=mc², which states that energy and mass are interchangeable. His Theory of General Relativity redefined our understanding of gravity as the curvature of space-time caused by massive objects. Einstein won the Nobel Prize in Physics in 1921 for his discovery of the photoelectric effect.",

    evolution: "Evolution is the process by which living organisms change over successive generations through natural selection, mutation, genetic drift, and gene flow. Charles Darwin proposed the theory of evolution by natural selection in 1859 in his book 'On the Origin of Species'. Organisms that are better adapted to their environment tend to survive and reproduce more successfully, passing favorable traits to offspring. Over millions of years, this leads to the emergence of new species and the diversity of life we see today.",

    cell: "A cell is the basic structural and functional unit of all living organisms. Cells were first discovered by Robert Hooke in 1665. There are two main types: prokaryotic cells (like bacteria), which have no nucleus, and eukaryotic cells (like plant and animal cells), which have a defined nucleus. Key parts of a cell include the nucleus (which contains DNA), the mitochondria (which produce energy), the cell membrane (which controls what enters and exits), and ribosomes (which build proteins).",

    dna: "DNA, or Deoxyribonucleic Acid, is the molecule that carries the genetic instructions for the development, functioning, growth, and reproduction of all known living organisms. It is shaped like a double helix — two strands twisted around each other, discovered by Watson and Crick in 1953. DNA is made of four chemical bases: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C). Genes are specific sequences of DNA that code for proteins, which carry out most of the body's functions.",

    atom: "An atom is the smallest unit of an element that retains the chemical properties of that element. Atoms consist of three types of subatomic particles: protons and neutrons in the nucleus at the center, and electrons orbiting the nucleus in shells. Protons carry a positive charge, electrons carry a negative charge, and neutrons have no charge. The number of protons determines what element an atom is — for example, all carbon atoms have 6 protons. Atoms bond together to form molecules and compounds.",

    mitosis: "Mitosis is the process of cell division in which one parent cell divides to produce two identical daughter cells, each with the same number of chromosomes as the original. It is essential for growth, repair, and asexual reproduction in living organisms. Mitosis occurs in four main stages: Prophase (chromosomes condense), Metaphase (chromosomes align in the middle), Anaphase (chromosomes are pulled apart), and Telophase (two new nuclei form). This is followed by cytokinesis, where the cytoplasm divides.",

    pythagoras: "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides. Written as a formula: a² + b² = c², where c is the hypotenuse. For example, if one side is 3 and the other is 4, the hypotenuse is 5 (because 9 + 16 = 25). This theorem is fundamental in geometry and is used in architecture, navigation, physics, and computer graphics.",

    osmosis: "Osmosis is the movement of water molecules through a semi-permeable membrane from an area of lower solute concentration to an area of higher solute concentration. This process continues until equilibrium is reached. It is a passive process — it requires no energy. Osmosis is critical in biology: it helps plant roots absorb water from the soil, maintains cell shape, and regulates water balance in the human body. A classic example is a wilting plant that recovers after being watered.",

    climate: "Climate change refers to long-term shifts in global temperatures and weather patterns. While some climate change is natural, since the 1800s human activities — especially the burning of fossil fuels like coal, oil, and gas — have been the main driver. This releases greenhouse gases like carbon dioxide and methane, which trap heat in the atmosphere in what is known as the greenhouse effect. Consequences include rising sea levels, more extreme weather events, melting polar ice, and threats to biodiversity and food security.",

    democracy: "Democracy is a system of government in which power is held by the people, either directly or through elected representatives. The word comes from the Greek words 'demos' (people) and 'kratos' (power). Key principles of democracy include free and fair elections, protection of individual rights, rule of law, and freedom of speech and press. There are two main types: direct democracy, where citizens vote on laws directly, and representative democracy, where elected officials make decisions on behalf of the people.",

    ww2: "World War II was a global conflict fought from 1939 to 1945, involving most of the world's nations. It began when Nazi Germany under Adolf Hitler invaded Poland on September 1, 1939. The war was fought between the Allies (including the UK, USA, Soviet Union, and France) and the Axis powers (Germany, Italy, and Japan). Major events include the Holocaust, the Battle of Britain, D-Day, and the atomic bombings of Hiroshima and Nagasaki. The war ended in 1945 and resulted in approximately 70-85 million deaths, making it the deadliest conflict in human history.",

    french_revolution: "The French Revolution was a period of radical political and social transformation in France from 1789 to 1799. It was driven by widespread inequality, financial crisis, and Enlightenment ideas about liberty and equality. Key events include the storming of the Bastille on July 14, 1789 (now celebrated as Bastille Day), the Declaration of the Rights of Man, the execution of King Louis XVI, and the Reign of Terror. The Revolution ended with Napoleon Bonaparte's rise to power and had a lasting impact on modern democracy worldwide.",

    algebra: "Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols to solve equations and understand relationships between quantities. Instead of using specific numbers, algebra uses variables (like x and y) to represent unknown values. Key concepts include equations (e.g., 2x + 3 = 7), inequalities, functions, and polynomials. Algebra is foundational for advanced mathematics, science, engineering, economics, and computer science. It teaches logical thinking and problem-solving skills applicable in everyday life.",

    shakespeare: "William Shakespeare was an English playwright, poet, and actor born in 1564 in Stratford-upon-Avon, England. He is widely regarded as the greatest writer in the English language and the world's greatest dramatist. Shakespeare wrote 37 plays, 154 sonnets, and several longer poems. His works include tragedies like Hamlet, Othello, and Macbeth; comedies like A Midsummer Night's Dream and Much Ado About Nothing; and histories like Richard III. His plays have been translated into every major language and are performed more often than those of any other playwright.",

    water_cycle: "The water cycle, also known as the hydrological cycle, describes the continuous movement of water on, above, and below Earth's surface. It has four main stages: Evaporation (water from oceans, lakes, and rivers is heated by the sun and turns into water vapor), Condensation (water vapor rises, cools, and forms clouds), Precipitation (water falls back to Earth as rain, snow, or hail), and Collection (water collects in oceans, rivers, lakes, and groundwater). The water cycle is essential for distributing freshwater across the planet and regulating climate.",
  };

  for (const key in topicAnswers) {
    if (lowerPrompt.includes(key.replace('_', ' ')) || lowerPrompt.includes(key)) {
      return { text: topicAnswers[key] };
    }
  }

  if (isCasual) {
    const currentUserId = userId || 'default';
    const newCount = incrementUserQueryCount(currentUserId);
    if (newCount <= 10) {
      const currentEmotion = (emotionState?.emotion && ['sad', 'angry', 'fearful', 'happy'].includes(emotionState.emotion.toLowerCase())) 
        ? emotionState.emotion.toLowerCase() as 'sad' | 'angry' | 'fearful' | 'happy' | 'neutral'
        : 'neutral';
      const responsesList = emotionalResponses[language][currentEmotion];
      const randomFriendlyText = responsesList[Math.floor(Math.random() * responsesList.length)];
      return { text: `${randomFriendlyText} (How can I help you learn today?)`, newCount };
    } else {
      return { text: "Let's get back to studying! 📚" };
    }
  }

  const eduKeywords = ['gravity', 'math', 'science', 'history', 'photosynthesis', 'equation', 'cell', 'atom', 'dna', 'mitosis', 'osmosis', 'climate', 'democracy', 'algebra', 'newton', 'einstein'];
  const isEducational = eduKeywords.some(k => lowerPrompt.includes(k));
  if (!isCasual && !isEducational) {
    return { text: "I'm VidyAI's learning assistant! Try asking about Science, Math, History and more 📚" };
  }

  let responseText = "";

  if (emotionState && emotionState.emotion) {
    const emotion = emotionState.emotion.toLowerCase();
    const validEmotion = (['sad', 'angry', 'fearful', 'happy'].includes(emotion) ? emotion : 'neutral') as 'sad' | 'angry' | 'fearful' | 'happy' | 'neutral';

    const emotionResponses = emotionalResponses[language][validEmotion];
    responseText = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];

    if (emotionState.fatigueScore && emotionState.fatigueScore > 60) {
      const fatiguePhrases = {
        en: "I notice you might be getting tired. Let's keep this explanation brief.",
        hi: "मुझे लगता है कि आप थक रहे हैं। आइए इस स्पष्टीकरण को संक्षिप्त रखें।",
        te: "మీరు అలసిపోతున్నట్లు నాకు అనిపిస్తోంది. ఈ వివరణను సంక్షిప్తంగా ఉంచుదాం."
      };
      responseText += " " + fatiguePhrases[language];
    }
  }
  else if (learningStyle && learningStyle.primaryStyle !== 'unknown') {
    responseText = learningStyleResponses[language][learningStyle.primaryStyle as 'visual' | 'auditory' | 'kinesthetic'];
  }
  else {
    const neutralResponses = emotionalResponses[language].neutral;
    responseText = neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
  }

  const subjectContext = {
    en: {
      math: " In mathematics, ",
      science: " In science, ",
      history: " In history, ",
      english: " In language arts, "
    },
    hi: {
      math: " गणित में, ",
      science: " विज्ञान में, ",
      history: " इतिहास में, ",
      english: " भाषा कला में, "
    },
    te: {
      math: " గణితంలో, ",
      science: " విజ్ఞానశాస్త్రంలో, ",
      history: " చరిత్రలో, ",
      english: " భాషా కళలలో, "
    }
  };

  if (subject !== 'general' && subjectContext[language][subject as 'math' | 'science' | 'history' | 'english']) {
    responseText += subjectContext[language][subject as 'math' | 'science' | 'history' | 'english'];
  }

  return { text: responseText };
}

export function repairTruncatedJson(str: string): string {
  let cleaned = str.trim();
  
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
    }
  }

  if (inString) {
    cleaned += '"';
  }

  let openBraces: string[] = [];
  inString = false;
  escapeNext = false;
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        openBraces.push(char);
      } else if (char === '}') {
        if (openBraces[openBraces.length - 1] === '{') {
          openBraces.pop();
        }
      } else if (char === ']') {
        if (openBraces[openBraces.length - 1] === '[') {
          openBraces.pop();
        }
      }
    }
  }

  while (openBraces.length > 0) {
    const last = openBraces.pop();
    if (last === '{') {
      cleaned += '}';
    } else if (last === '[') {
      cleaned += ']';
    }
  }

  return cleaned;
}

export function safeJsonParse(str: string): any {
  let cleaned = str.trim();
  
  // Clean markdown code blocks from the JSON string
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();

  // Repair truncated JSON first to close any open quotes/braces
  cleaned = repairTruncatedJson(cleaned);

  // Strip single-line comments
  cleaned = cleaned.replace(/\/\/.*$/gm, "");

  // Strip multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");

  // Strip trailing commas from objects and arrays
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    console.warn("Standard JSON.parse failed, attempting aggressive scanning repair.");
    try {
      // Escape raw newlines inside JSON string values safely via character scanning
      let repaired = "";
      let inString = false;
      let escapeNext = false;
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (escapeNext) {
          repaired += char;
          escapeNext = false;
          continue;
        }
        if (char === '\\') {
          repaired += char;
          escapeNext = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          repaired += char;
          continue;
        }
        if (inString && char === '\n') {
          repaired += '\\n';
        } else if (inString && char === '\r') {
          repaired += '\\r';
        } else {
          repaired += char;
        }
      }
      return JSON.parse(repaired);
    } catch (repairedError) {
      console.warn("Aggressive JSON repair failed");
      return null;
    }
  }
}

export function extractStringField(jsonStr: string, fieldName: string): string | null {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)"\\s*(?:,\\s*"[a-zA-Z0-9_-]+"\\s*:|\\s*})`, "i");
  const match = jsonStr.match(regex);
  if (match) {
    return match[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
  }
  const fallbackRegex = new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)"`, "i");
  const fallbackMatch = jsonStr.match(fallbackRegex);
  if (fallbackMatch) {
    return fallbackMatch[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
  }
  return null;
}

export function extractBalancedObject(str: string): string | null {
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let startIndex = str.indexOf('{');
  
  if (startIndex === -1) return null;
  
  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return str.substring(startIndex, i + 1);
        }
      }
    }
  }
  return null;
}

export interface AiSummaryResult {
  title: string;
  summary: string;
  mindMapData: {
    id: string;
    label: string;
    color?: string;
    children?: any[];
  };
}

export function getApiKey(): string | null {
  const rawKey = typeof window !== 'undefined' 
    ? localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY 
    : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
  if (!rawKey) return null;
  const trimmed = rawKey.trim();
  if (trimmed === "" || 
      trimmed === "undefined" || 
      trimmed === "null" || 
      trimmed === "your-api-key-here" || 
      trimmed === "your_actual_gemini_api_key_here") {
    return null;
  }
  return trimmed;
}

export async function generateAiSummaryAndMindmap(
  topic: string,
  subject: string = "Science",
  syllabus: string = "General"
): Promise<AiSummaryResult> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

      const systemPrompt = `You are a high-quality educational content creator. The user will specify a topic. 
You must respond with a JSON object containing:
1. "title": The name of the topic (capitalized).
2. "summary": A detailed, clear educational summary of the topic suitable for K-12 students. Use paragraphs and bullet points.
3. "mindMapData": A hierarchical tree structure of the concept map. The root node is the topic.
   Each node in the tree MUST have this exact interface:
   interface MindMapNode {
     id: string;
     label: string; // 1-3 words max
     color?: string; // Hex color string corresponding to branch theme
     children?: MindMapNode[];
   }
   Limit the tree to a root node, 3 primary branches, and 2-3 leaf nodes per branch.
   
Respond ONLY with a valid JSON block matching the above description. Do not wrap in markdown quotes.`;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + "\n\nTopic: " + topic }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        let title = topic;
        let summary = "";
        let mindMapData = null;

        const parsed = safeJsonParse(rawText);
        if (parsed) {
          title = parsed.title || topic;
          summary = parsed.summary || "";
          mindMapData = parsed.mindMapData || null;
        } else {
          console.warn("safeJsonParse failed for summary, attempting regex extraction on raw text");
          
          // Regex extraction of title
          const titleVal = extractStringField(rawText, "title");
          if (titleVal) {
            title = titleVal;
          }

          // Regex extraction of summary
          const summaryVal = extractStringField(rawText, "summary");
          if (summaryVal) {
            summary = summaryVal;
          }

          // Regex extraction of mindMapData
          const mindMapMatch = rawText.match(/"mindMapData"\s*:\s*(\{[\s\S]*\})/i);
          if (mindMapMatch) {
            try {
              const block = extractBalancedObject(mindMapMatch[1]);
              if (block) {
                mindMapData = safeJsonParse(block);
              }
            } catch (e) {
              console.warn("Failed to parse extracted mindMapData JSON:", e);
            }
          }
        }

        if (summary) {
          return {
            title,
            summary,
            mindMapData: mindMapData || { id: "root", label: title }
          };
        }
      }
    } catch (e) {
      console.error("Failed to generate AI summary, falling back to mock:", e);
    }
  }

  // Fallback database of high-fidelity mock summaries for common topics
  const mockSummariesDb: Record<string, { summary: string; mindMapData: any }> = {
    "python": {
      summary: "Python is a high-level, interpreted programming language known for its exceptional readability and simplicity. Created by Guido van Rossum and released in 1991, Python's design philosophy emphasizes clean code layout, specifically using indentation rather than braces to define code blocks.\n\nKey concepts of Python include:\n• Ease of Learning: Python has a simple, English-like syntax, making it highly accessible for beginners.\n• Interpreted Execution: Programs are executed line-by-line by an interpreter, allowing rapid prototyping and easy debugging.\n• Rich Standard Library: Python supports thousands of modules for tasks ranging from file handling to machine learning and game development.\n• Multi-paradigm Support: Developers can choose object-oriented, functional, or procedural styles to build applications.",
      mindMapData: {
        id: "root-python",
        label: "Python",
        color: "#3b82f6",
        children: [
          {
            id: "py1",
            label: "Key Features",
            color: "#10b981",
            children: [
              { id: "py1_1", label: "Clean Syntax", color: "#10b981" },
              { id: "py1_2", label: "Interpreted", color: "#10b981" }
            ]
          },
          {
            id: "py2",
            label: "Use Cases",
            color: "#ea580c",
            children: [
              { id: "py2_1", label: "Web Dev", color: "#ea580c" },
              { id: "py2_2", label: "Data Science", color: "#ea580c" },
              { id: "py2_3", label: "AI & Automation", color: "#ea580c" }
            ]
          },
          {
            id: "py3",
            label: "Ecosystem",
            color: "#db2777",
            children: [
              { id: "py3_1", label: "Pip Packages", color: "#db2777" },
              { id: "py3_2", label: "Libraries", color: "#db2777" }
            ]
          }
        ]
      }
    },
    "artificial intelligence": {
      summary: "Artificial Intelligence (AI) refers to the development of computer systems that can perform tasks that historically required human intelligence. These tasks include learning from experience, reasoning, recognizing speech, understanding visual inputs, and making complex decisions.\n\nMain fields of AI research include:\n• Machine Learning: Teaching systems to identify patterns and make predictions from data without explicit programming.\n• Deep Learning: Using multi-layered artificial neural networks inspired by the human brain to process complex data.\n• Natural Language Processing (NLP): Enabling systems to understand, translate, and respond to human speech and text.\n• Robotics & Computer Vision: Training machines to perceive and physically interact with objects in their environment.",
      mindMapData: {
        id: "root-ai",
        label: "Artificial Intelligence",
        color: "#8b5cf6",
        children: [
          {
            id: "ai1",
            label: "Core Pillars",
            color: "#ec4899",
            children: [
              { id: "ai1_1", label: "Machine Learning", color: "#ec4899" },
              { id: "ai1_2", label: "Deep Learning", color: "#ec4899" }
            ]
          },
          {
            id: "ai2",
            label: "User Interaction",
            color: "#3b82f6",
            children: [
              { id: "ai2_1", label: "Natural Language", color: "#3b82f6" },
              { id: "ai2_2", label: "Computer Vision", color: "#3b82f6" }
            ]
          },
          {
            id: "ai3",
            label: "Applications",
            color: "#10b981",
            children: [
              { id: "ai3_1", label: "Smart Assistants", color: "#10b981" },
              { id: "ai3_2", label: "Automation", color: "#10b981" }
            ]
          }
        ]
      }
    },
    "quantum physics": {
      summary: "Quantum Physics is the study of matter and energy at the most fundamental level, specifically at the scale of atoms and subatomic particles. Traditional laws of physics break down at this level, giving way to counter-intuitive behaviors governed by probability rather than certainty.\n\nCore phenomena include:\n• Wave-Particle Duality: Subatomic particles, such as electrons and photons, behave like both wave-like disturbances and distinct particles.\n• Superposition: An unmeasured particle exists in a combination of all possible states simultaneously.\n• Quantum Entanglement: Two or more particles become linked, so that measurements on one instantly determine the state of the other, even across huge distances.\n• Heisenberg Uncertainty Principle: The position and momentum of a particle cannot be measured simultaneously with absolute precision.",
      mindMapData: {
        id: "root-quantum",
        label: "Quantum Physics",
        color: "#06b6d4",
        children: [
          {
            id: "qp1",
            label: "Phenomena",
            color: "#f59e0b",
            children: [
              { id: "qp1_1", label: "Superposition", color: "#f59e0b" },
              { id: "qp1_2", label: "Entanglement", color: "#f59e0b" }
            ]
          },
          {
            id: "qp2",
            label: "Duality",
            color: "#10b981",
            children: [
              { id: "qp2_1", label: "Wave behavior", color: "#10b981" },
              { id: "qp2_2", label: "Particle behavior", color: "#10b981" }
            ]
          },
          {
            id: "qp3",
            label: "Applications",
            color: "#db2777",
            children: [
              { id: "qp3_1", label: "Quantum Computers", color: "#db2777" },
              { id: "qp3_2", label: "Semiconductors & Lasers", color: "#db2777" }
            ]
          }
        ]
      }
    }
  };

  const normalizedTopic = topic.toLowerCase().trim();
  if (mockSummariesDb[normalizedTopic]) {
    const matched = mockSummariesDb[normalizedTopic];
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      title: topic.charAt(0).toUpperCase() + topic.slice(1),
      summary: matched.summary,
      mindMapData: matched.mindMapData
    };
  }

  // Fallback to structured mock responses
  const title = topic.charAt(0).toUpperCase() + topic.slice(1);
  const content = `${title} is a key concept in ${subject}. It refers to the study and practical application of related components. Under the ${syllabus} curriculum, understanding ${title} involves looking at its history, its core components, and its interactions with other systems.\n\nKey aspects include:\n• Core Definitions: Understanding the foundational rules and concepts of ${title}.\n• Practical Applications: Real-world experiments and everyday examples where ${title} is used.\n• Future Trends: How this topic continues to evolve and affect our daily lives through modern science and research.`;
  
  const mindMapData = {
    id: "root",
    label: title,
    color: "#3b82f6",
    children: [
      {
        id: "c1",
        label: "Introduction",
        color: "#10b981",
        children: [
          { id: "c1-1", label: "History", color: "#10b981" },
          { id: "c1-2", label: "Foundations", color: "#10b981" }
        ]
      },
      {
        id: "c2",
        label: "Core Principles",
        color: "#f59e0b",
        children: [
          { id: "c2-1", label: "Rules", color: "#f59e0b" },
          { id: "c2-2", label: "Examples", color: "#f59e0b" }
        ]
      },
      {
        id: "c3",
        label: "Future Trends",
        color: "#ec4899",
        children: [
          { id: "c3-1", label: "Key Points", color: "#ec4899" },
          { id: "c3-2", label: "Applications", color: "#ec4899" }
        ]
      }
    ]
  };

  // Wait a small delay to simulate generation
  await new Promise(resolve => setTimeout(resolve, 1500));

  return { title, summary: content, mindMapData };
}

export function extractArray(parsed: any): any[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    for (const key in parsed) {
      if (Array.isArray(parsed[key])) {
        return parsed[key];
      }
    }
  }
  return null;
}

export async function generateAiQuiz(
  subject: string,
  syllabus: string = "General",
  numQuestions: number = 5
): Promise<any[]> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

      const systemPrompt = `You are an expert school teacher creating educational quizzes for K-12 students. 
You must respond with a JSON array containing ${numQuestions} multiple-choice questions for the subject "${subject}" under the "${syllabus}" syllabus.
Each question object in the array must match this interface:
interface QuizQuestion {
  question: string; // The quiz question text
  options: [
    { id: "a", text: string, isCorrect: boolean },
    { id: "b", text: string, isCorrect: boolean },
    { id: "c", text: string, isCorrect: boolean },
    { id: "d", text: string, isCorrect: boolean }
  ]; // Exactly 4 options, one must be correct (isCorrect: true) and other 3 false
  points: number; // set to 20
  topic: string; // Subtopic name
}

Respond ONLY with a valid JSON block containing the array of questions. Do not wrap in markdown quotes.`;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + `\n\nGenerate ${numQuestions} questions for ${subject}.` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        
        let arrayData: any[] | null = null;
        const parsed = safeJsonParse(rawText);
        if (parsed) {
          arrayData = extractArray(parsed);
        }
        
        if (!arrayData) {
          console.warn("Quiz JSON parsing failed, attempting regex/brace extraction on raw text");
          
          // Match the outer JSON array first
          const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (arrayMatch) {
            arrayData = safeJsonParse(arrayMatch[0]);
          }
          
          // If arrayData is still null or empty, parse it question-by-question using regex
          if (!arrayData || arrayData.length === 0) {
            arrayData = [];
            const questionBlocks = rawText.match(/\{\s*"question"[\s\S]*?"options"[\s\S]*?\}/g);
            if (questionBlocks) {
              for (const block of questionBlocks) {
                try {
                  const questionText = extractStringField(block, "question") || "";
                  
                  const optionsMatch = block.match(/"options"\s*:\s*\[([\s\S]*?)\]/);
                  const options: any[] = [];
                  if (optionsMatch) {
                    const optItems = optionsMatch[1].match(/\{\s*"id"[\s\S]*?\}/g);
                    if (optItems) {
                      for (const optItem of optItems) {
                        const idVal = extractStringField(optItem, "id");
                        const textVal = extractStringField(optItem, "text");
                        const correctMatch = optItem.match(/"isCorrect"\s*:\s*(true|false)/);
                        if (idVal && textVal) {
                          options.push({
                            id: idVal,
                            text: textVal,
                            isCorrect: correctMatch ? correctMatch[1] === "true" : false
                          });
                        }
                      }
                    }
                  }
                  
                  if (questionText && options.length > 0) {
                    const topicVal = extractStringField(block, "topic") || subject;
                    const pointsMatch = block.match(/"points"\s*:\s*(\d+)/);
                    arrayData.push({
                      question: questionText,
                      options: options,
                      points: pointsMatch ? parseInt(pointsMatch[1], 10) : 20,
                      topic: topicVal
                    });
                  }
                } catch (e) {
                  console.warn("Failed to extract individual question block:", e);
                }
              }
            }
          }
        }

        if (arrayData && arrayData.length > 0) {
          return arrayData.map((q, idx) => ({
            id: `ai-quiz-${idx}-${Date.now()}`,
            question: q.question,
            options: q.options,
            points: q.points || 20,
            subject: subject,
            syllabus: syllabus as any,
            topic: q.topic || subject
          }));
        }
      }
    } catch (e) {
      console.error("Failed to generate AI quiz:", e);
    }
  }

  return [];
}

export async function generateAiFlashcards(
  subject: string,
  syllabus: string = "General",
  numFlashcards: number = 5
): Promise<any[]> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

      const systemPrompt = `You are a high-quality educational flashcard generator.
You must respond with a JSON array containing ${numFlashcards} flashcards for the subject "${subject}" under the "${syllabus}" syllabus.
Each flashcard in the array must match this interface:
interface Flashcard {
  front: string; // The question, term or prompt
  back: string;  // The answer, definition or explanation (concise and clear)
}

Respond ONLY with a valid JSON block containing the array of flashcards. Do not wrap in markdown quotes.`;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + `\n\nGenerate ${numFlashcards} flashcards for ${subject}.` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        
        let arrayData: any[] | null = null;
        const parsed = safeJsonParse(rawText);
        if (parsed) {
          arrayData = extractArray(parsed);
        }
        
        if (!arrayData) {
          console.warn("Flashcards JSON parsing failed, attempting regex/brace extraction on raw text");
          
          // Match the outer JSON array block
          const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (arrayMatch) {
            arrayData = safeJsonParse(arrayMatch[0]);
          }
          
          // If arrayData is still null or empty, parse it card-by-card using regex
          if (!arrayData || arrayData.length === 0) {
            arrayData = [];
            const cardBlocks = rawText.match(/\{\s*"front"[\s\S]*?"back"[\s\S]*?\}/g);
            if (cardBlocks) {
              for (const block of cardBlocks) {
                try {
                  const frontVal = extractStringField(block, "front");
                  const backVal = extractStringField(block, "back");
                  if (frontVal && backVal) {
                    arrayData.push({
                      front: frontVal,
                      back: backVal
                    });
                  }
                } catch (e) {
                  console.warn("Failed to extract individual card block:", e);
                }
              }
            }
          }
        }

        if (arrayData && arrayData.length > 0) {
          return arrayData.map((card, idx) => ({
            id: `ai-card-${idx}-${Date.now()}`,
            front: card.front,
            back: card.back,
            subject: subject,
            syllabus: syllabus as any
          }));
        }
      }
    } catch (e) {
      console.error("Failed to generate AI flashcards:", e);
    }
  }

  return [];
}
