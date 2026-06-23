import type { EmotionState } from "@/services/gemini-api"

export type LearnerStatusLanguage = "en" | "hi" | "te"

export type LearnerStatusInput = Pick<
  EmotionState,
  "emotion" | "fatigueScore" | "attentionScore"
> & {
  confidence?: number
  faceDetected?: boolean
}

export type LearnerStatusLabel =
  | "needsBreak"
  | "focusModerate"
  | "focusHigh"
  | "focusTracking"
  | "learningSupport"

const STATUS_TEXT: Record<
  LearnerStatusLabel,
  Record<LearnerStatusLanguage, string>
> = {
  needsBreak: {
    en: "Needs a Short Break",
    hi: "छोटे ब्रेक की जरूरत",
    te: "చిన్న విరామం అవసరం",
  },
  focusModerate: {
    en: "Focus Level: Moderate",
    hi: "फोकस स्तर: मध्यम",
    te: "ఫోకస్ స్థాయి: మధ్యస్థ",
  },
  focusHigh: {
    en: "Focus Level: High",
    hi: "फोकस स्तर: उच्च",
    te: "ఫోకస్ స్థాయి: అధిక",
  },
  focusTracking: {
    en: "Focus Tracking Active",
    hi: "फोकस ट्रैकिंग सक्रिय",
    te: "ఫోకస్ ట్రాకింగ్ యాక్టివ్",
  },
  learningSupport: {
    en: "Learning Support Recommended",
    hi: "शिक्षण सहायता अनुशंसित",
    te: "అభ్యాస మద్దతు సిఫార్సు చేయబడింది",
  },
}

const SUPPORTIVE_EMOTIONS = new Set([
  "sad",
  "fearful",
  "angry",
  "disgusted",
  "confused",
  "bored",
])

const HIGH_FOCUS_EMOTIONS = new Set(["happy", "focused"])

export function getLearnerStatusKey(
  input: LearnerStatusInput | undefined
): LearnerStatusLabel | null {
  if (!input?.emotion || input.emotion === "unknown") return null

  const fatigue = input.fatigueScore ?? 0
  const attention = input.attentionScore ?? 100

  if (fatigue > 70) return "needsBreak"
  if (fatigue > 50 || (attention >= 30 && attention <= 55)) return "focusModerate"
  if (attention < 30) return "focusTracking"

  if (HIGH_FOCUS_EMOTIONS.has(input.emotion)) return "focusHigh"
  if (SUPPORTIVE_EMOTIONS.has(input.emotion)) return "learningSupport"
  if (input.emotion === "surprised") return "focusModerate"
  if (input.emotion === "neutral") return "focusTracking"

  return "focusTracking"
}

export function getLearnerStatusLabel(
  input: LearnerStatusInput | undefined,
  language: LearnerStatusLanguage = "en"
): string | null {
  const key = getLearnerStatusKey(input)
  if (!key) return null
  return STATUS_TEXT[key][language]
}

export function getEnergyLevelLabel(
  fatigueScore: number | undefined,
  language: LearnerStatusLanguage = "en"
): string {
  const score = fatigueScore ?? 0
  const labels = {
    en: { high: "High", moderate: "Moderate", low: "Low", full: "Full" },
    hi: { high: "कम", moderate: "मध्यम", low: "अच्छा", full: "पूर्ण" },
    te: { high: "తక్కువ", moderate: "మధ్యస్థ", low: "మంచి", full: "పూర్తి" },
  }[language]

  if (score > 75) return labels.high
  if (score > 50) return labels.moderate
  if (score > 25) return labels.low
  return labels.full
}

export function getFocusLevelLabel(
  attentionScore: number | undefined,
  language: LearnerStatusLanguage = "en"
): string {
  const score = attentionScore ?? 100
  const labels = {
    en: { high: "High", moderate: "Moderate", low: "Low", veryLow: "Very Low" },
    hi: { high: "उच्च", moderate: "मध्यम", low: "कम", veryLow: "बहुत कम" },
    te: { high: "అధిక", moderate: "మధ్యస్థ", low: "తక్కువ", veryLow: "చాలా తక్కువ" },
  }[language]

  if (score > 75) return labels.high
  if (score > 50) return labels.moderate
  if (score > 25) return labels.low
  return labels.veryLow
}

export function getLearnerStatusTip(
  input: LearnerStatusInput | undefined,
  language: LearnerStatusLanguage = "en"
): string | null {
  if (!input?.emotion || input.emotion === "unknown") return null

  const fatigue = input.fatigueScore ?? 0
  if (fatigue > 70) {
    return {
      en: "A quick stretch or sip of water can help you come back refreshed.",
      hi: "थोड़ा विस्तार या पानी पीने से आप तरोताजा होकर वापस आ सकते हैं।",
      te: "చిన్నగా stretch చేయడం లేదా నీరు తాగడం మీరు తాజాగా తిరిగి రావడానికి సహాయపడుతుంది.",
    }[language]
  }

  const tips: Record<string, Record<LearnerStatusLanguage, string>> = {
    sad: {
      en: "Extra support is available — try a simpler explanation or a short pause.",
      hi: "अतिरिक्त सहायता उपलब्ध है — सरल व्याख्या या छोटा विराम आज़माएं।",
      te: "అదనపు మద్దతు అందుబాటులో ఉంది — సరళమైన వివరణ లేదా చిన్న విరామం ప్రయత్నించండి.",
    },
    fearful: {
      en: "It's okay to take this step by step. Ask for a simpler breakdown anytime.",
      hi: "इसे कदम दर कदम लेना ठीक है। कभी भी सरल विभाजन मांगें।",
      te: "దీన్ని దశలవారీగా తీసుకోవడం సరే. ఎప్పుడైనా సరళమైన విభజన అడగండి.",
    },
    angry: {
      en: "Let's slow down — smaller steps often make tough topics click.",
      hi: "धीरे चलें — छोटे कदम अक्सर कठिन विषयों को समझने में मदद करते हैं।",
      te: "నెమ్మదిగా ముందుకు వెళ్దాం — చిన్న దశలు కఠిన అంశాలను అర్థం చేసుకోవడంలో సహాయపడతాయి.",
    },
    disgusted: {
      en: "Switching topics or taking a quick pause might refresh your focus.",
      hi: "विषय बदलना या छोटा विराम लेना आपके फोकस को ताज़ा कर सकता है।",
      te: "విషయం మార్చడం లేదా చిన్న విరామం తీసుకోవడం మీ ఫోకస్‌ను రిఫ్రెష్ చేయవచ్చు.",
    },
    confused: {
      en: "Try asking for an example or a step-by-step walkthrough.",
      hi: "उदाहरण या चरण-दर-चरण व्याख्या मांगने का प्रयास करें।",
      te: "ఉదాహరణ లేదా దశలవారీ వివరణ అడగడానికి ప్రయత్నించండి.",
    },
    bored: {
      en: "A quick challenge or different activity can re-engage you.",
      hi: "एक त्वरित चुनौती या अलग गतिविधि आपको फिर से जोड़ सकती है।",
      te: "త్వరిత సవాలు లేదా వేరే కార్యకలాపం మిమ్మల్ని మళ్లీ నిమగ్నం చేయవచ్చు.",
    },
    happy: {
      en: "Great energy! This is a good moment for something challenging.",
      hi: "बढ़िया ऊर्जा! यह कुछ चुनौतीपूर्ण करने का अच्छा समय है।",
      te: "మంచి శక్తి! సవాలుగా ఉండేదానికి ఇది మంచి సమయం.",
    },
    focused: {
      en: "You're in a strong learning zone — keep going!",
      hi: "आप एक मजबूत सीखने के क्षेत्र में हैं — जारी रखें!",
      te: "మీరు బలమైన అభ్యాస మోడ్‌లో ఉన్నారు — కొనసాగించండి!",
    },
    neutral: {
      en: "You're engaged and ready. Keep going!",
      hi: "आप जुड़े हुए और तैयार हैं। जारी रखें!",
      te: "మీరు నిమగ్నంగా ఉన్నారు. కొనసాగించండి!",
    },
    surprised: {
      en: "Curiosity is a great sign — explore this topic further!",
      hi: "जिज्ञासा एक अच्छा संकेत है — इस विषय को और जानें!",
      te: "ఆసక్తి మంచి సంకేతం — ఈ అంశాన్ని మరింత అ explored చేయండి!",
    },
  }

  return tips[input.emotion]?.[language] ?? tips.neutral[language]
}

export function shouldShowLearnerStatus(
  input: LearnerStatusInput | undefined,
  trackingActive: boolean
): boolean {
  return trackingActive && getLearnerStatusKey(input) !== null
}
