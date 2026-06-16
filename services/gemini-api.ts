
import { LearningStyleProfile, generateLearningStylePrompt } from './learning-style-service';

interface GeminiResponse {
  text: string;
  error?: string;
}

export type Subject = 'math' | 'science' | 'history' | 'english' | 'general';

export type EmotionState = {
  emotion: string;
  fatigueScore?: number;
  attentionScore?: number;
};

export async function getGeminiResponse(
  prompt: string,
  subject: Subject = 'general',
  language: 'en' | 'hi' | 'te' = 'en',
  learningStyle?: LearningStyleProfile,
  emotionState?: EmotionState
): Promise<GeminiResponse> {
  try {
    

    // --- Build system prompt ---
    let systemPrompt = `You are VidyAI, a friendly and encouraging AI tutor for school students (classes 6–12).

CORE BEHAVIOR:
- Respond like a patient, warm teacher sitting beside the student — never like a chatbot. Speak directly and encouragingly.
- Keep responses SHORT: 3–5 sentences or 3–4 bullet points max. Give just enough to understand; the student can always ask for more.
- Use simple language. Explain concepts step by step. Prioritize clarity and immediate understanding over completeness.
- Use real-life analogies and relatable, everyday examples to make abstract concepts easy to grasp.
- Never produce walls of text. Break your writing into very short paragraphs or bullet points with frequent line breaks.
- End responses with exactly ONE short follow-up question or the phrase "Want to go deeper? Just ask!" — never ask multiple questions.

SUBJECT: ${subject}

LANGUAGE:
${language === 'hi' ? 'Respond entirely in Hindi.' : language === 'te' ? 'Respond entirely in Telugu.' : 'Respond in English.'}

AMBIGUOUS/TYPO QUERIES:
- If the query is unclear or seems like a typo, do not guess or write a long answer. Suggest 2–3 likely meanings in a single line, then ask ONE short clarification question.

CLASS-LEVEL PERSONALIZATION:
- If the student mentions their class or grade, adapt your vocabulary, depth, and choice of analogies accordingly.
- Default to a middle school level (Class 8) if the grade is unknown.

MERMAID DIAGRAMS:
- For topics like cycles, processes, or workflows (e.g. water cycle, photosynthesis, mitosis), include a simple Mermaid diagram after your explanation using this format:
\`\`\`mermaid
graph TD
  A[Step 1] --> B[Step 2]
\`\`\`
- Only use diagrams when they genuinely help. Not for every response.`;

    // Inject learning style context
    if (learningStyle) {
      systemPrompt += `\n\nLEARNING STYLE:\n${generateLearningStylePrompt(learningStyle, emotionState)}`;
    }

    // Inject emotion context
    if (emotionState) {
      systemPrompt += `\n\nEMOTION AWARENESS:\nThe student currently appears ${emotionState.emotion}.`;
      const emotionGuide: Record<string, string> = {
        sad: 'Be extra warm and encouraging. Use positive reinforcement to build their confidence.',
        angry: 'Acknowledge their frustration calmly. Take a step back and offer a fresh, simpler approach.',
        fearful: 'Be deeply reassuring. Reassure them that it is okay to struggle. Break the topic into the smallest possible steps.',
        confused: 'Use a simple, vivid analogy first. Gently ask what part confused them.',
        happy: 'Match their energy! Celebrate their enthusiasm and introduce a fun challenge or a slightly deeper angle.',
        neutral: 'Keep a steady, friendly, and supportive tone.',
      };
      const guide = emotionGuide[emotionState.emotion.toLowerCase()] || emotionGuide.neutral;
      systemPrompt += ` ${guide}`;

      if (emotionState.fatigueScore !== undefined && emotionState.fatigueScore > 60) {
        systemPrompt += ` Student shows ${emotionState.fatigueScore}% fatigue — keep the response extra short and suggest a break if needed.`;
      }
      if (emotionState.attentionScore !== undefined && emotionState.attentionScore < 40) {
        systemPrompt += ` Attention is low — use an engaging hook or fun fact to start.`;
      }
    }

    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Groq API request failed');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    return { text };

  } catch (error: any) {
    console.error('Groq API error:', error);
    return {
      text: 'Sorry, I ran into an issue. Please try again in a moment!',
      error: error.message,
    };
  }
}

// --- Everything below is unchanged ---

export function repairTruncatedJson(str: string): string {
  let cleaned = str.trim();
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; }
  }
  if (inString) cleaned += '"';

  let openBraces: string[] = [];
  inString = false; escapeNext = false;
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (!inString) {
      if (char === '{' || char === '[') openBraces.push(char);
      else if (char === '}' && openBraces[openBraces.length - 1] === '{') openBraces.pop();
      else if (char === ']' && openBraces[openBraces.length - 1] === '[') openBraces.pop();
    }
  }
  while (openBraces.length > 0) {
    cleaned += openBraces.pop() === '{' ? '}' : ']';
  }
  return cleaned;
}

export function safeJsonParse(str: string): any {
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();
  cleaned = repairTruncatedJson(cleaned);
  cleaned = cleaned.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/,(\s*[}\]])/g, "$1");
  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      let repaired = ""; let inString = false; let escapeNext = false;
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (escapeNext) { repaired += char; escapeNext = false; continue; }
        if (char === '\\') { repaired += char; escapeNext = true; continue; }
        if (char === '"') { inString = !inString; repaired += char; continue; }
        if (inString && char === '\n') repaired += '\\n';
        else if (inString && char === '\r') repaired += '\\r';
        else repaired += char;
      }
      return JSON.parse(repaired);
    } catch { return null; }
  }
}

export function extractStringField(jsonStr: string, fieldName: string): string | null {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)"\\s*(?:,\\s*"[a-zA-Z0-9_-]+"\\s*:|\\s*})`, "i");
  const match = jsonStr.match(regex);
  if (match) return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
  const fallback = jsonStr.match(new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)"`, "i"));
  if (fallback) return fallback[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
  return null;
}

export function extractBalancedObject(str: string): string | null {
  let braceCount = 0, inString = false, escapeNext = false;
  const startIndex = str.indexOf('{');
  if (startIndex === -1) return null;
  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (!inString) {
      if (char === '{') braceCount++;
      else if (char === '}') { braceCount--; if (braceCount === 0) return str.substring(startIndex, i + 1); }
    }
  }
  return null;
}

export interface AiSummaryResult {
  title: string;
  summary: string;
  mindMapData: { id: string; label: string; color?: string; children?: any[]; };
}

export function getApiKey(): string | null {
  const rawKey = typeof window !== 'undefined'
    ? localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!rawKey) return null;
  const trimmed = rawKey.trim();
  if (["", "undefined", "null", "your-api-key-here", "your_actual_gemini_api_key_here"].includes(trimmed)) return null;
  return trimmed;
}

export async function generateAiSummaryAndMindmap(
  topic: string,
  subject: string = "Science",
  syllabus: string = "General"
): Promise<AiSummaryResult> {


  
    try {

      const systemPrompt = 
      `You are a high-quality educational content creator. The user will specify a topic. 
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
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nTopic: " + topic }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096, responseMimeType: "application/json" }
      };

      const response = await fetch('/api/gemini', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        let title = topic, summary = "", mindMapData = null;
        const parsed = safeJsonParse(rawText);
        if (parsed) {
          title = parsed.title || topic; summary = parsed.summary || ""; mindMapData = parsed.mindMapData || null;
        } else {
          const titleVal = extractStringField(rawText, "title"); if (titleVal) title = titleVal;
          const summaryVal = extractStringField(rawText, "summary"); if (summaryVal) summary = summaryVal;
          const mindMapMatch = rawText.match(/"mindMapData"\s*:\s*(\{[\s\S]*\})/i);
          if (mindMapMatch) { const block = extractBalancedObject(mindMapMatch[1]); if (block) mindMapData = safeJsonParse(block); }
        }
        if (summary) return { title, summary, mindMapData: mindMapData || { id: "root", label: title } };
      }
    } catch (e) { console.error("Failed to generate AI summary, falling back to mock:", e); }
  

  const mockSummariesDb: Record<string, { summary: string; mindMapData: any }> = {
    "python": {
      summary: "Python is a high-level, interpreted programming language known for its exceptional readability and simplicity. Created by Guido van Rossum and released in 1991, Python's design philosophy emphasizes clean code layout, specifically using indentation rather than braces to define code blocks.\n\nKey concepts of Python include:\n• Ease of Learning: Python has a simple, English-like syntax, making it highly accessible for beginners.\n• Interpreted Execution: Programs are executed line-by-line by an interpreter, allowing rapid prototyping and easy debugging.\n• Rich Standard Library: Python supports thousands of modules for tasks ranging from file handling to machine learning and game development.\n• Multi-paradigm Support: Developers can choose object-oriented, functional, or procedural styles to build applications.\n• Variety of Real-World Applications: Python is widely used in web development, data science and machine learning, workflow automation, scientific computing, IoT, and robotics.",
      mindMapData: { id: "root-python", label: "Python", color: "#3b82f6", children: [{ id: "py1", label: "Key Features", color: "#10b981", children: [{ id: "py1_1", label: "Clean Syntax", color: "#10b981" }, { id: "py1_2", label: "Interpreted", color: "#10b981" }] }, { id: "py2", label: "Use Cases", color: "#ea580c", children: [{ id: "py2_1", label: "Web Dev", color: "#ea580c" }, { id: "py2_2", label: "Data Science", color: "#ea580c" }, { id: "py2_3", label: "AI & Automation", color: "#ea580c" }] }, { id: "py3", label: "Ecosystem", color: "#db2777", children: [{ id: "py3_1", label: "Pip Packages", color: "#db2777" }, { id: "py3_2", label: "Libraries", color: "#db2777" }] }] }
    },
    "artificial intelligence": {
      summary: "Artificial Intelligence (AI) refers to the development of computer systems that can perform tasks that historically required human intelligence.\n\nMain fields include:\n• Machine Learning: Teaching systems to identify patterns from data.\n• Deep Learning: Multi-layered neural networks for complex data.\n• Natural Language Processing: Understanding human speech and text.\n• Robotics: Machines that perceive and interact with the world.\n• Computer Vision: Training machines to interpret and understand visual information from the world.",
      mindMapData: { id: "root-ai", label: "Artificial Intelligence", color: "#8b5cf6", children: [{ id: "ai1", label: "Core Pillars", color: "#ec4899", children: [{ id: "ai1_1", label: "Machine Learning", color: "#ec4899" }, { id: "ai1_2", label: "Deep Learning", color: "#ec4899" }] }, { id: "ai2", label: "User Interaction", color: "#3b82f6", children: [{ id: "ai2_1", label: "Natural Language", color: "#3b82f6" }, { id: "ai2_2", label: "Computer Vision", color: "#3b82f6" }] }, { id: "ai3", label: "Applications", color: "#10b981", children: [{ id: "ai3_1", label: "Smart Assistants", color: "#10b981" }, { id: "ai3_2", label: "Automation", color: "#10b981" }] }] }
    },
    "quantum physics": {
      summary: "Quantum Physics studies matter and energy at the atomic and subatomic scale where classical physics breaks down.\n\nCore phenomena:\n• Wave-Particle Duality: Particles behave like both waves and particles.\n• Superposition: A particle exists in all possible states until measured.\n• Quantum Entanglement: Linked particles instantly affect each other regardless of distance.\n• Uncertainty Principle: Position and momentum cannot both be precisely known.",
      mindMapData: { id: "root-quantum", label: "Quantum Physics", color: "#06b6d4", children: [{ id: "qp1", label: "Phenomena", color: "#f59e0b", children: [{ id: "qp1_1", label: "Superposition", color: "#f59e0b" }, { id: "qp1_2", label: "Entanglement", color: "#f59e0b" }] }, { id: "qp2", label: "Duality", color: "#10b981", children: [{ id: "qp2_1", label: "Wave behavior", color: "#10b981" }, { id: "qp2_2", label: "Particle behavior", color: "#10b981" }] }, { id: "qp3", label: "Applications", color: "#db2777", children: [{ id: "qp3_1", label: "Quantum Computers", color: "#db2777" }, { id: "qp3_2", label: "Semiconductors", color: "#db2777" }] }] }
    }
  };

  const normalizedTopic = topic.toLowerCase().trim();
  if (mockSummariesDb[normalizedTopic]) {
    const matched = mockSummariesDb[normalizedTopic];
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { title: topic.charAt(0).toUpperCase() + topic.slice(1), summary: matched.summary, mindMapData: matched.mindMapData };
  }

  const title = topic.charAt(0).toUpperCase() + topic.slice(1);
  const content = `${title} is a key concept in ${subject}.\n\nKey aspects include:\n• Core Definitions: Understanding the foundational rules and concepts of ${title}.\n• Practical Applications: Real-world experiments and everyday examples.\n• Future Trends: How this topic continues to evolve through modern science.`;
  const mindMapData = { id: "root", label: title, color: "#3b82f6", children: [{ id: "c1", label: "Introduction", color: "#10b981", children: [{ id: "c1-1", label: "History", color: "#10b981" }, { id: "c1-2", label: "Foundations", color: "#10b981" }] }, { id: "c2", label: "Core Principles", color: "#f59e0b", children: [{ id: "c2-1", label: "Rules", color: "#f59e0b" }, { id: "c2-2", label: "Examples", color: "#f59e0b" }] }, { id: "c3", label: "Future Trends", color: "#ec4899", children: [{ id: "c3-1", label: "Key Points", color: "#ec4899" }, { id: "c3-2", label: "Applications", color: "#ec4899" }] }] };
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { title, summary: content, mindMapData };
}

export async function generateAiSummaryFromDocument(
  text: string,
  filename: string,
  subject: string = "Science",
  syllabus: string = "General"
): Promise<AiSummaryResult> {
  try {
    const systemPrompt = 
      `You are a high-quality educational content creator. The user will provide the text extracted from a document titled "${filename}".
      You must respond with a JSON object containing:
      1. "title": A suitable title for the summary (capitalized).
      2. "summary": A detailed, clear educational summary of the provided text suitable for K-12 students under the "${syllabus}" syllabus for the subject "${subject}". Use paragraphs and bullet points.
      3. "mindMapData": A hierarchical tree structure of the concept map. The root node is the title.
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
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nDocument Text:\n" + text.substring(0, 15000) }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096, responseMimeType: "application/json" }
    };

    const response = await fetch('/api/gemini', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      let title = filename, summary = "", mindMapData = null;
      const parsed = safeJsonParse(rawText);
      if (parsed) {
        title = parsed.title || filename; summary = parsed.summary || ""; mindMapData = parsed.mindMapData || null;
      } else {
        const titleVal = extractStringField(rawText, "title"); if (titleVal) title = titleVal;
        const summaryVal = extractStringField(rawText, "summary"); if (summaryVal) summary = summaryVal;
        const mindMapMatch = rawText.match(/"mindMapData"\s*:\s*(\{[\s\S]*\})/i);
        if (mindMapMatch) { const block = extractBalancedObject(mindMapMatch[1]); if (block) mindMapData = safeJsonParse(block); }
      }
      if (summary) return { title, summary, mindMapData: mindMapData || { id: "root", label: title } };
    }
  } catch (e) { console.error("Failed to generate AI summary from document:", e); }
  
  const title = filename.split('.')[0] || "Document Summary";
  return { 
    title, 
    summary: "Could not generate summary from the document due to an error.", 
    mindMapData: { id: "root", label: title, color: "#3b82f6" } 
  };
}
export function extractArray(parsed: any): any[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    for (const key in parsed) { if (Array.isArray(parsed[key])) return parsed[key]; }
  }
  return null;
}

export async function generateAiQuiz(subject: string, syllabus: string = "General", numQuestions: number = 5): Promise<any[]> {

  
    try {

      const systemPrompt = `You are an expert school teacher creating educational quizzes for K-12 students. 
You must respond with a JSON array containing ${numQuestions} multiple-choice questions for the subject "${subject}" under the "${syllabus}" syllabus.
Each question object must match:
interface QuizQuestion {
  question: string;
  options: [{ id: "a", text: string, isCorrect: boolean }, { id: "b", text: string, isCorrect: boolean }, { id: "c", text: string, isCorrect: boolean }, { id: "d", text: string, isCorrect: boolean }];
  points: number; // set to 20
  topic: string;
}
Respond ONLY with a valid JSON array. Do NOT wrap in markdown quotes.`;
      const requestBody = { contents: [{ role: "user", parts: [{ text: systemPrompt + `\n\nGenerate ${numQuestions} questions for ${subject}.` }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 4096, responseMimeType: "application/json" } };
      const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        let arrayData: any[] | null = null;
        const parsed = safeJsonParse(rawText);
        if (parsed) arrayData = extractArray(parsed);
        if (!arrayData) {
          const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (arrayMatch) arrayData = safeJsonParse(arrayMatch[0]);
          if (!arrayData || arrayData.length === 0) {
            arrayData = [];
            const questionBlocks = rawText.match(/\{\s*"question"[\s\S]*?"options"[\s\S]*?\}/g);
            if (questionBlocks) {
              for (const block of questionBlocks) {
                const questionText = extractStringField(block, "question") || "";
                const optionsMatch = block.match(/"options"\s*:\s*\[([\s\S]*?)\]/);
                const options: any[] = [];
                if (optionsMatch) {
                  const optItems = optionsMatch[1].match(/\{\s*"id"[\s\S]*?\}/g);
                  if (optItems) for (const optItem of optItems) { const idVal = extractStringField(optItem, "id"); const textVal = extractStringField(optItem, "text"); const correctMatch = optItem.match(/"isCorrect"\s*:\s*(true|false)/); if (idVal && textVal) options.push({ id: idVal, text: textVal, isCorrect: correctMatch ? correctMatch[1] === "true" : false }); }
                }
                if (questionText && options.length > 0) { const topicVal = extractStringField(block, "topic") || subject; const pointsMatch = block.match(/"points"\s*:\s*(\d+)/); arrayData.push({ question: questionText, options, points: pointsMatch ? parseInt(pointsMatch[1], 10) : 20, topic: topicVal }); }
              }
            }
          }
        }
        if (arrayData && arrayData.length > 0) return arrayData.map((q, idx) => ({ id: `ai-quiz-${idx}-${Date.now()}`, question: q.question, options: q.options, points: q.points || 20, subject, syllabus: syllabus as any, topic: q.topic || subject }));
      }
    } catch (e) { console.error("Failed to generate AI quiz:", e); }
  
  return [];
}

export async function generateAiFlashcards(subject: string, syllabus: string = "General", numFlashcards: number = 5): Promise<any[]> {

  
    
    try {

      const systemPrompt = `You are a high-quality educational flashcard generator.
        You must respond with a JSON array containing ${numFlashcards} flashcards for the subject "${subject}" under the "${syllabus}" syllabus.
        Each flashcard must match:
        interface Flashcard { front: string; back: string; }
        Respond ONLY with a valid JSON array. Do NOT wrap in markdown quotes.`;
      const requestBody = { contents: [{ role: "user", parts: [{ text: systemPrompt + `\n\nGenerate ${numFlashcards} flashcards for ${subject}.` }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 4096, responseMimeType: "application/json" } };
      const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        let arrayData: any[] | null = null;
        const parsed = safeJsonParse(rawText);
        if (parsed) arrayData = extractArray(parsed);
        if (!arrayData) {
          const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (arrayMatch) arrayData = safeJsonParse(arrayMatch[0]);
          if (!arrayData || arrayData.length === 0) {
            arrayData = [];
            const cardBlocks = rawText.match(/\{\s*"front"[\s\S]*?"back"[\s\S]*?\}/g);
            if (cardBlocks) for (const block of cardBlocks) { const frontVal = extractStringField(block, "front"); const backVal = extractStringField(block, "back"); if (frontVal && backVal) arrayData.push({ front: frontVal, back: backVal }); }
          }
        }
        if (arrayData && arrayData.length > 0) return arrayData.map((card, idx) => ({ id: `ai-card-${idx}-${Date.now()}`, front: card.front, back: card.back, subject, syllabus: syllabus as any }));
      }
    } catch (e) { console.error("Failed to generate AI flashcards:", e); }
  
  return [];
}