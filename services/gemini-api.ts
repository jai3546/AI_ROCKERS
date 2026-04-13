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

    // Construct the API URL for Gemini 1.5 Flash model
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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
    const validEmotion = ['sad', 'angry', 'fearful', 'happy'].includes(emotion) ? emotion : 'neutral';

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
