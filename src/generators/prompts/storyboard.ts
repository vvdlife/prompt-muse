import type { ReferenceData } from '../core';

export const generateStoryboardPrompt = (
    platform: 'chatgpt' | 'gemini',
    topic: string,
    genre: string,
    duration: string,
    mood: string = '',
    targetAudience: string = '',
    characters: string = '',
    refData: ReferenceData | null = null,
    _language: 'ko' | 'en' = 'ko'
): string => {
    const role = 'You are a professional film director and screenwriter (Video Content Expert).';

    let context = `
  - Core Topic: ${topic}
  - Genre: ${genre}
  - Duration: ${duration}
  `;

    if (mood) context += `- Mood/Tone: ${mood}\n  `;
    if (targetAudience) context += `- Target Audience: ${targetAudience}\n  `;
    if (characters) context += `- Key Characters: ${characters}\n  `;

    // v4.0 URL Reference Injection
    if (refData && refData.url) {
        context += `
  - Reference Source (Style/Content Grounding):
    - URL: ${refData.url}
    - Title: ${refData.title}
    - Summary: ${refData.description}
    - Keywords: ${refData.keywords}
    `;
    }

    const task = `Based on the context above, write a perfect video storyboard and script plan.`;

    const constraints = `
    1. **Language Requirement**: The final output MUST be written in **KOREAN (한국어)**. Do not output English unless it's a technical term or specified.
    2. Format: Use a structured Markdown Table.
    3. Columns: [Scene #] | [Visual Description (Korean)] | [Audio/Script (Korean)] | [Camera Moment] | [Est. Time]
    4. "Visual Description" must be vivid and reflect the mood (${mood || 'Default'}).
    5. "Camera Movement" should use professional terms (e.g., Dolly Zoom, Pan, Tilt) in English or Korean.
    ${refData ? `6. **Reference Integration**: Actively incorporate the style and insights from the provided Reference Source.` : ''}
    7. After the table, provide a set of "English Image Prompts" for each scene so I can generate them in Midjourney.
    `;

    return `
# ${platform === 'gemini' ? 'Gemini' : 'ChatGPT'} Expert Prompt
${role}

## Task
${task}

## Context
${context}

## Constraints
${constraints}

## Output Format
Markdown Table (in Korean)
`;
};
