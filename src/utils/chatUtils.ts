/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  language?: 'en' | 'sw' | 'sheng';
  tokensUsed?: number;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  tone: 'balanced' | 'direct' | 'sheng' | 'swahili';
}

export type AvatarStyle = 'emerald' | 'amber' | 'indigo' | 'cyan' | 'violet' | 'rose';
export type AvatarIconType = 'bot' | 'zap' | 'flame' | 'book' | 'code' | 'crown';
export type FormalityLevel = 'casual' | 'balanced' | 'formal';
export type DirectnessLevel = 'punchy' | 'balanced' | 'detailed';
export type ShengLevel = 'heavy' | 'moderate' | 'minimal';

export type TrainingType = 'fact' | 'qa' | 'vocabulary' | 'rule';

export interface TrainingItem {
  id: string;
  userId?: string;
  type: TrainingType;
  title: string;
  prompt: string;     // trigger question, term, or topic
  response: string;   // target answer, definition, rule, or fact
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export const SAMPLE_TRAINING_ITEMS: TrainingItem[] = [
  {
    id: 'sample_1',
    type: 'fact',
    title: 'My Location & Workspace',
    prompt: 'Where am I based? / Where do I work?',
    response: 'I am based in Westlands, Nairobi, Kenya working remotely as a creative tech entrepreneur.',
    enabled: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  },
  {
    id: 'sample_2',
    type: 'vocabulary',
    title: 'Sheng: Chapa Luku',
    prompt: 'chapa luku',
    response: 'Refers to dressing sharp, wearing stylish outfits, or looking extremely clean and fly.',
    enabled: true,
    createdAt: 1700000001000,
    updatedAt: 1700000001000
  },
  {
    id: 'sample_3',
    type: 'qa',
    title: 'My Business: NaiTech',
    prompt: 'Tell me about my venture / what is NaiTech?',
    response: 'NaiTech is your Nairobi-based venture providing premium smart accessories and gadgets with same-day delivery.',
    enabled: true,
    createdAt: 1700000002000,
    updatedAt: 1700000002000
  },
  {
    id: 'sample_4',
    type: 'rule',
    title: 'Salutation Preference',
    prompt: 'How to address me',
    response: 'When we converse in Sheng or casual tone, address me as "Kiongozi" or "Boss".',
    enabled: true,
    createdAt: 1700000003000,
    updatedAt: 1700000003000
  }
];

export interface PersonaPreset {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarStyle: AvatarStyle;
  avatarIcon: AvatarIconType;
  formality: FormalityLevel;
  directness: DirectnessLevel;
  shengLevel: ShengLevel;
  badge: string;
}

export interface PersonaConfig {
  presetId: string;
  name: string;
  avatarStyle: AvatarStyle;
  avatarIcon: AvatarIconType;
  customInitial?: string;
  formality: FormalityLevel;
  directness: DirectnessLevel;
  shengLevel: ShengLevel;
  customToneNote?: string;
}

export const PRESET_PERSONAS: PersonaPreset[] = [
  {
    id: 'tony-urban',
    name: 'TONY AI',
    role: 'Urban Companion',
    description: 'Sharp, street-smart, natural English/Sheng/Swahili mix with punchy mobile answers.',
    avatarStyle: 'emerald',
    avatarIcon: 'zap',
    formality: 'casual',
    directness: 'punchy',
    shengLevel: 'moderate',
    badge: 'Original'
  },
  {
    id: 'tony-coach',
    name: 'Tony Mwamba',
    role: 'Hustle & Action Coach',
    description: 'High energy, motivating Nairobi business coach. Chapa kazi, no excuses, direct momentum.',
    avatarStyle: 'amber',
    avatarIcon: 'flame',
    formality: 'casual',
    directness: 'punchy',
    shengLevel: 'heavy',
    badge: 'Hustler 🔥'
  },
  {
    id: 'tony-teacher',
    name: 'Tony Mwalimu',
    role: 'Patient Educator & Sage',
    description: 'Breaks complex topics down with vivid analogies in Kiswahili sanifu, Sheng, or English.',
    avatarStyle: 'indigo',
    avatarIcon: 'book',
    formality: 'balanced',
    directness: 'detailed',
    shengLevel: 'moderate',
    badge: 'Mwalimu 📚'
  },
  {
    id: 'tony-dev',
    name: 'Tony Dev',
    role: 'Code & Tech Genius',
    description: 'Direct code architecture, clean syntax, debugging solutions, and tech slang.',
    avatarStyle: 'cyan',
    avatarIcon: 'code',
    formality: 'balanced',
    directness: 'punchy',
    shengLevel: 'moderate',
    badge: 'Coder 💻'
  },
  {
    id: 'tony-diplomat',
    name: 'Tony Diplomat',
    role: 'Executive & Formal Advisor',
    description: 'Eloquent, professional Kenyan English and polite Kiswahili for corporate work & formal writing.',
    avatarStyle: 'violet',
    avatarIcon: 'crown',
    formality: 'formal',
    directness: 'balanced',
    shengLevel: 'minimal',
    badge: 'Executive 👔'
  }
];

export const DEFAULT_PERSONA_CONFIG: PersonaConfig = {
  presetId: 'tony-urban',
  name: 'TONY AI',
  avatarStyle: 'emerald',
  avatarIcon: 'zap',
  customInitial: 'T',
  formality: 'casual',
  directness: 'punchy',
  shengLevel: 'moderate',
  customToneNote: ''
};

/**
 * Generates a clean 3-6 word title for a new conversation based on the first message.
 */
export function generateTitle(firstMessage: string): string {
  if (!firstMessage || !firstMessage.trim()) {
    return 'New Conversation';
  }
  const clean = firstMessage.trim().replace(/[\r\n]+/g, ' ');
  if (clean.length <= 32) {
    return clean;
  }
  const words = clean.split(' ').slice(0, 6).join(' ');
  return words.length > 32 ? words.slice(0, 29) + '...' : words;
}

/**
 * Estimates token count based on typical character-to-token ratio (~4 chars per token).
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Detects whether the input text looks predominantly like Sheng, Kiswahili, or English.
 */
export function detectLanguage(text: string): 'en' | 'sw' | 'sheng' {
  if (!text) return 'en';
  const lower = text.toLowerCase();

  // Distinctive Sheng vocabulary
  const shengKeywords = [
    'niaje', 'rada', 'msee', 'chapa', 'form', 'manze', 'buda', 'wasee',
    'maze', 'mbogi', 'aluta', 'nduthi', 'bob', 'doba', 'morio', 'ganji',
    'shapa', 'starehe', 'dimbwi', 'sasa', 'jamo', 'chali', 'dem', 'mresh',
    'wamlambez', 'rieng', 'ngori', 'fiti'
  ];

  // Distinctive Kiswahili vocabulary
  const swahiliKeywords = [
    'habari', 'jambo', 'kwaheri', 'asante', 'tafadhali', 'mambo', 'nzuri',
    'nini', 'wapi', 'lini', 'kwanini', 'gani', 'rafiki', 'leo', 'kesho',
    'jana', 'kitabu', 'shule', 'kazi', 'safari', 'chakula', 'maji', 'sana',
    'hujambo', 'sijambo', 'karibu', 'hakuna', 'matata'
  ];

  let shengScore = 0;
  for (const kw of shengKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lower)) shengScore += 2;
  }

  let swahiliScore = 0;
  for (const kw of swahiliKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lower)) swahiliScore += 1.5;
  }

  if (shengScore >= 2 && shengScore >= swahiliScore) {
    return 'sheng';
  }
  if (swahiliScore >= 1.5) {
    return 'sw';
  }
  return 'en';
}

/**
 * Builds the system instruction for TONY AI incorporating persona, tone, and language tuning.
 */
export function buildSystemPrompt(
  toneOrPersona: 'balanced' | 'direct' | 'sheng' | 'swahili' | PersonaConfig = 'balanced',
  trainings?: TrainingItem[]
): string {
  let promptText = '';

  // If passed a simple tone string
  if (typeof toneOrPersona === 'string') {
    const base = `You are TONY AI, a mobile-first, high-intelligence personal AI assistant.
Your creator and namesake is Tony. You are designed to be friendly, sharp, direct, and exceptionally helpful on mobile screens.

Core Directives:
1. Languages Supported:
   - English: Clear, natural, articulate, and actionable.
   - Kiswahili: Fluent, authentic, polite yet approachable (sanifu na yenye uelewa mkubwa).
   - Sheng: Authentic Kenyan street slang and youth culture (e.g., 'niaje msee', 'rada ni gani', 'uko fiti', 'haina wasiwasi', 'tuko pamoja', 'chapa kazi').
   - You seamlessly understand code-switching between English, Swahili, and Sheng. Respond in the language or mix the user addresses you in, unless requested otherwise.

2. Personality & Tone:
   - Friendly and respectful, but direct and straight to the point.
   - Avoid long-winded corporate fluff or disclaimers. Give the punchy, useful answer first.
   - Use concise formatting (bullet points, clear headers, code blocks with syntax tags) optimized for small smartphone displays.
   - If asked who you are, introduce yourself proudly as "TONY AI - your personal AI assistant".`;

    switch (toneOrPersona) {
      case 'direct':
        promptText = `${base}\n\nTone Adjustment: Maximum conciseness. Give bullet points, direct facts, and immediate steps. No fillers.`;
        break;
      case 'sheng':
        promptText = `${base}\n\nTone Adjustment: Kenyan Sheng vibe active! Speak naturally like a cool, sharp Nairobi buddy ('buda', 'msee', 'rada', 'uko fiti'). Keep the substance smart, solid, and helpful while rocking Sheng slang.`;
        break;
      case 'swahili':
        promptText = `${base}\n\nTone Adjustment: Kiswahili fasaha chenye uelewa mzuri na ukarimu wa dhati. Jibu kwa lugha safi ya Kiswahili inayoeleweka haraka.`;
        break;
      case 'balanced':
      default:
        promptText = `${base}\n\nTone Adjustment: Balanced, warm, clear, and direct.`;
        break;
    }
  } else {
    // PersonaConfig object provided
    const persona = toneOrPersona;
    const assistantName = persona.name || 'TONY AI';

    let formalityInstruction = 'Maintain a warm, approachable, everyday conversational balance.';
    if (persona.formality === 'casual') {
      formalityInstruction = 'Keep it casual, chilled, relaxed, and street-friendly like a trusted buddy.';
    } else if (persona.formality === 'formal') {
      formalityInstruction = 'Adopt a refined, executive, professional tone suitable for business, work, and formal correspondence.';
    }

    let directnessInstruction = 'Provide balanced answers with key context and practical takeaways.';
    if (persona.directness === 'punchy') {
      directnessInstruction = 'Be extremely direct, punchy, and concise. Put the answer in the first line. Use bullet points and zero fluff.';
    } else if (persona.directness === 'detailed') {
      directnessInstruction = 'Provide thoughtful, step-by-step breakdowns with vivid examples while staying clear and easy to follow.';
    }

    let shengInstruction = 'Use standard Kenyan English and conversational Swahili, with natural Nairobi slang where fitting.';
    if (persona.shengLevel === 'heavy') {
      shengInstruction = 'Lean heavily into authentic Kenyan Sheng (e.g. rada, wasee, chapa, form, fiti, buda, manze). Embrace Nairobi street culture enthusiastically.';
    } else if (persona.shengLevel === 'minimal') {
      shengInstruction = 'Keep Sheng slang to a minimum. Prefer clean, grammatically sound English or Kiswahili Sanifu.';
    }

    promptText = `You are ${assistantName}, a mobile-first personal AI assistant.
Core Identity: You are friendly, direct, sharp, and genuinely helpful. Never robotic, boring, or overly verbose.

Active Persona Profile:
- Persona Name: ${assistantName} (Preset: ${persona.presetId})
- Formality Level: ${persona.formality.toUpperCase()} (${formalityInstruction})
- Directness & Length: ${persona.directness.toUpperCase()} (${directnessInstruction})
- Sheng & Slang Calibration: ${persona.shengLevel.toUpperCase()} (${shengInstruction})
${persona.customToneNote ? `- Custom User Guidance: ${persona.customToneNote}` : ''}

Language Capabilities:
- Fluently handle English, Kiswahili, and Sheng.
- Match the user's chosen language, code-switching, or specific request seamlessly.
- Format responses cleanly with bolding, bullet points, and code blocks optimized for phone screens.
- Keep the core nature always friendly, respectful, and direct.`;
  }

  // Append user-trained custom knowledge and memory if provided
  const activeTrainings = trainings ? trainings.filter(t => t.enabled) : [];
  if (activeTrainings.length > 0) {
    const memoryBlocks = activeTrainings.map(t => {
      switch (t.type) {
        case 'qa':
          return `• [Q&A Knowledge] Trigger: "${t.prompt}" -> Answer: "${t.response}"`;
        case 'vocabulary':
          return `• [Slang/Vocabulary] Term: "${t.prompt}" -> Definition/Meaning: "${t.response}"`;
        case 'rule':
          return `• [Behavioral Rule] Directive: "${t.title}": "${t.response}"`;
        case 'fact':
        default:
          return `• [Taught Fact] "${t.title}": "${t.response}" (Related topic/trigger: ${t.prompt})`;
      }
    }).join('\n');

    promptText += `\n\n=== USER-TRAINED KNOWLEDGE & MEMORY (CRITICAL OVERRIDE) ===
You have been trained by the user with the following verified memories, Q&A pairs, custom vocabulary, and rules. Whenever a user question relates to any of these topics, you MUST treat this knowledge as authoritative and weave it accurately into your answer:
${memoryBlocks}`;
  }

  return promptText;
}

/**
 * Formats timestamps for chat messages.
 */
export function formatMessageTime(timestamp: number): string {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
