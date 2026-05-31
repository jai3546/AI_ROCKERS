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

    // Construct the API URL for Gemini 2.5 Flash model
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
        maxOutputTokens: 2048,  // Increased token limit for more detailed responses
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
export function getMockGeminiResponse(
  prompt: string,
  subject: Subject = 'general',
  language: 'en' | 'hi' | 'te' = 'en',
  learningStyle?: LearningStyleProfile,
  emotionState?: EmotionState
): GeminiResponse {
  // Emotional response templates
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

  // Learning style specific responses
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

  // Determine which response set to use
  let responseText = "";

  // If we have emotion data, use emotional responses
  if (emotionState && emotionState.emotion) {
    const emotion = emotionState.emotion.toLowerCase();
    const validEmotion = (['sad', 'angry', 'fearful', 'happy'].includes(emotion) ? emotion : 'neutral') as 'sad' | 'angry' | 'fearful' | 'happy' | 'neutral';

    const emotionResponses = emotionalResponses[language][validEmotion];
    responseText = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];

    // Add fatigue note if applicable
    if (emotionState.fatigueScore && emotionState.fatigueScore > 60) {
      const fatiguePhrases = {
        en: "I notice you might be getting tired. Let's keep this explanation brief.",
        hi: "मुझे लगता है कि आप थक रहे हैं। आइए इस स्पष्टीकरण को संक्षिप्त रखें।",
        te: "మీరు అలసిపోతున్నట్లు నాకు అనిపిస్తోంది. ఈ వివరణను సంక్షిప్తంగా ఉంచుదాం."
      };
      responseText += " " + fatiguePhrases[language];
    }
  }
  // If we have learning style data, incorporate that
  else if (learningStyle && learningStyle.primaryStyle !== 'unknown') {
    responseText = learningStyleResponses[language][learningStyle.primaryStyle as 'visual' | 'auditory' | 'kinesthetic'];
  }
  // Otherwise use neutral responses
  else {
    const neutralResponses = emotionalResponses[language].neutral;
    responseText = neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
  }

  // Add subject-specific context
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

export function safeJsonParse(str: string): any {
  let cleaned = str.trim();
  
  // Clean markdown code blocks from the JSON string
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();

  // Strip single-line comments
  cleaned = cleaned.replace(/\/\/.*$/gm, "");

  // Strip multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");

  // Strip trailing commas from objects and arrays
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    console.warn("Standard JSON.parse failed, attempting aggressive repair.", initialError);
    try {
      // Escape raw newlines inside JSON string values
      const repaired = cleaned.replace(/"([^"]*)"/g, (match, p1) => {
        return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
      });
      return JSON.parse(repaired);
    } catch (repairedError) {
      console.error("Aggressive JSON repair failed:", repairedError);
      throw initialError;
    }
  }
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

export async function generateAiSummaryAndMindmap(
  topic: string,
  subject: string = "Science",
  syllabus: string = "General"
): Promise<AiSummaryResult> {
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your-api-key-here') {
    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
          maxOutputTokens: 2048,
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
        
        const parsed = safeJsonParse(rawText);
        
        return {
          title: parsed.title || topic,
          summary: parsed.summary || "No summary generated.",
          mindMapData: parsed.mindMapData || { id: "root", label: topic }
        };
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
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your-api-key-here') {
    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
          maxOutputTokens: 2048,
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
        
        const parsed = safeJsonParse(rawText);
        const arrayData = extractArray(parsed);
        if (arrayData) {
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
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY : process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your-api-key-here') {
    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
          maxOutputTokens: 2048,
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
        
        const parsed = safeJsonParse(rawText);
        const arrayData = extractArray(parsed);
        if (arrayData) {
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
