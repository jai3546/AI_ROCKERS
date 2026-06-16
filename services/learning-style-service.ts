/**
 * Learning Style Service
 * This service implements the Persona Intelligence Engine to classify students
 * into visual, auditory, or kinesthetic learners and adapt content accordingly.
 */

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'unknown';

export interface LearningStyleProfile {
  primaryStyle: LearningStyle;
  secondaryStyle: LearningStyle;
  visualScore: number;
  auditoryScore: number;
  kinestheticScore: number;
  lastUpdated: Date;
}

// Initial learning style profile
export const initialLearningStyleProfile: LearningStyleProfile = {
  primaryStyle: 'unknown',
  secondaryStyle: 'unknown',
  visualScore: 33,
  auditoryScore: 33,
  kinestheticScore: 33,
  lastUpdated: new Date()
};

/**
 * Update learning style profile based on user interactions
 * @param currentProfile Current learning style profile
 * @param interactionData Data about user interactions
 * @returns Updated learning style profile
 */
export function updateLearningStyleProfile(
  currentProfile: LearningStyleProfile,
  interactionData: {
    videoInteractions?: number;
    audioInteractions?: number;
    practicalInteractions?: number;
    textInteractions?: number;
    imageInteractions?: number;
  }
): LearningStyleProfile {
  // Extract interaction data with defaults
  const {
    videoInteractions = 0,
    audioInteractions = 0,
    practicalInteractions = 0,
    textInteractions = 0,
    imageInteractions = 0
  } = interactionData;

  // Calculate new scores
  let visualScore = currentProfile.visualScore;
  let auditoryScore = currentProfile.auditoryScore;
  let kinestheticScore = currentProfile.kinestheticScore;

  // Update visual score (video, images, text)
  visualScore = Math.min(100, visualScore + (videoInteractions * 0.5) + (imageInteractions * 0.7) + (textInteractions * 0.3));

  // Update auditory score (audio, video)
  auditoryScore = Math.min(100, auditoryScore + (audioInteractions * 0.8) + (videoInteractions * 0.3));

  // Update kinesthetic score (practical interactions)
  kinestheticScore = Math.min(100, kinestheticScore + (practicalInteractions * 0.9));

  // Normalize scores to ensure they sum to a reasonable amount
  const total = visualScore + auditoryScore + kinestheticScore;
  if (total > 0) {
    const normalizer = 100 / (total / 3);
    visualScore = Math.round(visualScore * normalizer) / 100;
    auditoryScore = Math.round(auditoryScore * normalizer) / 100;
    kinestheticScore = Math.round(kinestheticScore * normalizer) / 100;
  }

  // Determine primary and secondary styles
  const scores = [
    { style: 'visual' as LearningStyle, score: visualScore },
    { style: 'auditory' as LearningStyle, score: auditoryScore },
    { style: 'kinesthetic' as LearningStyle, score: kinestheticScore }
  ].sort((a, b) => b.score - a.score);

  return {
    primaryStyle: scores[0].score > 40 ? scores[0].style : 'unknown',
    secondaryStyle: scores[1].score > 30 ? scores[1].style : 'unknown',
    visualScore,
    auditoryScore,
    kinestheticScore,
    lastUpdated: new Date()
  };
}

/**
 * Get content adaptation recommendations based on learning style
 * @param learningStyle The user's learning style profile
 * @param emotionData Optional emotion data to further personalize content
 * @returns Content adaptation recommendations
 */
export function getContentAdaptations(
  learningStyle: LearningStyleProfile,
  emotionData?: {
    emotion: string;
    fatigueScore?: number;
    attentionScore?: number;
  }
): {
  contentTypes: string[];
  presentationStyle: string;
  paceRecommendation: string;
  emotionalSupport?: string;
} {
  const { primaryStyle, secondaryStyle, visualScore, auditoryScore, kinestheticScore } = learningStyle;
  
  // Default recommendations
  let contentTypes: string[] = [];
  let presentationStyle = '';
  let paceRecommendation = 'moderate';
  let emotionalSupport: string | undefined;

  // Enhanced and highly targeted learning instructions prioritizing user preferences
  switch (primaryStyle) {
    case 'visual':
      contentTypes = ['diagrams', 'charts', 'flowcharts', 'videos', 'infographics', 'spatial maps'];
      presentationStyle = 'HEAVILY PREFER VISUAL PRESENTATION: Prioritize "showing" over "telling." Map out concepts spatially using videos, diagrams, explicit structural bullet points, bold key terms for emphasis, clear step-by-step numbering, and embedded ASCII layouts or Mermaid visualizations';
      break;
    case 'auditory':
      contentTypes = ['audio explanations', 'discussions', 'conversational tone', 'verbal instructions', 'mnemonics'];
      presentationStyle = 'HEAVILY PREFER AUDITORY PRESENTATION: Maintain a highly conversational, melodic, and rhythmic dialogue meant to be easily read out loud. Lean on engaging storytelling, clear conversational transitions, verbal markers, and word-sound association mnemonics';
      break;
    case 'kinesthetic':
      contentTypes = ['step-by-step challenges', 'interactive exercises', 'real-world scenarios', 'thought experiments', 'simulations', 'hands-on activities'];
      presentationStyle = 'HEAVILY PREFER KINESTHETIC PRESENTATION: Focus directly on physical action and mechanics. Use action-driven verbs, ground every description in tactical "if-then" scenarios, and immediately challenge the user with interactive thought experiments or mini-simulations';
      break;
    default:
      // Balanced multi-sensory approach
      contentTypes = ['varied content types', 'mixed media', 'summaries', 'examples', 'quick visuals'];
      presentationStyle = 'USE A MULTI-SENSORY BALANCED APPROACH: Provide a highly concise structural overview text, followed immediately by exactly one relatable real-world physical analogy, and conclude with a quick spatial map or itemized summary breakdown';
  }
  
  // Include secondary style elements
  if (secondaryStyle !== 'unknown' && secondaryStyle !== primaryStyle) {
    switch (secondaryStyle) {
      case 'visual':
        contentTypes.push('supporting visuals');
        break;
      case 'auditory':
        contentTypes.push('audio summaries');
        break;
      case 'kinesthetic':
        contentTypes.push('brief interactive elements');
        break;
    }
  }

  // Adapt based on emotion if available
  if (emotionData) {
    const { emotion, fatigueScore = 0, attentionScore = 100 } = emotionData;

    // Adjust pace based on fatigue and attention
    if (fatigueScore > 70 || attentionScore < 30) {
      paceRecommendation = 'slower, with more breaks';
      contentTypes.push('shorter segments');
    } else if (fatigueScore < 30 && attentionScore > 70) {
      paceRecommendation = 'can be more challenging';
      contentTypes.push('advanced content');
    }

    // Provide detailed emotional support parameters
    switch (emotion) {
      case 'sad':
        emotionalSupport = 'Be extra warm, deeply encouraging, and use direct positive reinforcement to gently build up their academic confidence';
        break;
      case 'angry':
        emotionalSupport = 'Calmly acknowledge their frustration upfront without escalating, then immediately step back and present a totally fresh, simplified conceptual approach';
        break;
      case 'fearful':
        emotionalSupport = 'Be intensely reassuring. Reassure them that making mistakes is a normal part of learning, and systematically deconstruct the topic into the smallest possible digestible actions';
        break;
      case 'confused':
        emotionalSupport = 'Deploy a clear, vivid physical analogy right at the beginning, and ask exactly one gentle targeted question to help isolate what tripped them up';
        break;
      case 'happy':
        emotionalSupport = 'Match their energetic momentum perfectly! Celebrate their enthusiasm and seamlessly integrate a fun problem-solving challenge or an intriguing deeper angle';
        break;
    }
  }

  return {
    contentTypes,
    presentationStyle,
    paceRecommendation,
    emotionalSupport
  };
}

/**
 * Generate a learning style prompt for AI tutors
 * @param learningStyle The user's learning style profile
 * @param emotionData Optional emotion data
 * @returns A prompt that can be added to AI instructions
 */
export function generateLearningStylePrompt(
  learningStyle: LearningStyleProfile,
  emotionData?: {
    emotion: string;
    fatigueScore?: number;
    attentionScore?: number;
  }
): string {
  const adaptations = getContentAdaptations(learningStyle, emotionData);
  
  let prompt = `Adapt your teaching to a ${learningStyle.primaryStyle !== 'unknown' ? 
    learningStyle.primaryStyle : 'balanced'} learner`;
  
  if (learningStyle.secondaryStyle !== 'unknown') {
    prompt += ` with ${learningStyle.secondaryStyle} tendencies`;
  }
  
  prompt += `. ${adaptations.presentationStyle}. `;
  prompt += `Focus on ${adaptations.contentTypes.join(', ')}. `;
  
  // Directly locks in the user preference throughout the chatbot session (Addressing Jai's comment)
  prompt += `CRITICAL: Do not default to generic text responses. The student explicitly prefers this learning style—ensure your formatting remains strictly locked to these guidelines throughout the chat. `;
  
  prompt += `Pace should be ${adaptations.paceRecommendation}. `;
  
  if (adaptations.emotionalSupport) {
    prompt += adaptations.emotionalSupport + '. ';
  }
  
  if (emotionData) {
    prompt += `The student currently appears ${emotionData.emotion}`;
    
    if (emotionData.fatigueScore !== undefined && emotionData.fatigueScore > 60) {
      prompt += ` and may be experiencing fatigue (${emotionData.fatigueScore}% fatigue detected)`;
    }
    
    if (emotionData.attentionScore !== undefined) {
      prompt += `. Their attention level is approximately ${emotionData.attentionScore}%`;
    }
    
    prompt += '. ';
  }
  
  return prompt;
}
