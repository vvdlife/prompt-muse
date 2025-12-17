export type Platform = 'chatgpt' | 'gemini' | 'midjourney' | 'veo3';

export interface PromptResult {
    platform: Platform;
    content: string;
}

export interface ReferenceData {
    url: string;
    title: string;
    description: string;
    keywords: string;
}

// ------------------------------------------------------------------
// 1. Storyboard Logic (ChatGPT / Gemini)
// ------------------------------------------------------------------

export const generateStoryboardPrompt = (
    platform: 'chatgpt' | 'gemini',
    topic: string,
    genre: string,
    duration: string,
    mood: string = '',
    targetAudience: string = '',
    characters: string = '',
    refData: ReferenceData | null = null, // v4.0 New Param
    _language: 'ko' | 'en' = 'ko'
): string => {
    // User requested "Prompt in English, Output in Korean" logic.
    // We use English for the System Instructions to get better logic from the LLM.

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

// ------------------------------------------------------------------
// 2. Asset Logic (Midjourney / Veo3)
// ------------------------------------------------------------------

const wrapForAsset = (input: string, _type: 'image' | 'video'): string => {
    return input;
};

export const generateMidjourneyExpertPrompt = (
    description: string,
    ar: string,
    stylize: number,
    weird: number,
    lighting: string = '',
    camera: string = '',
    color: string = '',
    texture: string = '',
    refData: ReferenceData | null = null // v4.0 New Param
): string => {
    const core = wrapForAsset(description, 'image');

    let details = '';
    if (lighting) details += `${lighting}, `;
    if (camera) details += `${camera}, `;
    if (color) details += `${color} color palette, `;
    if (texture) details += `${texture}, `;

    // v4.0 Inject Ref Data for styling
    if (refData) {
        details += `in the style of ${refData.title} (${refData.keywords}), `;
    }

    const params = `--ar ${ar} --stylize ${stylize} --weird ${weird} --q 2 --v 6.0 --no text, watermark, signature, letters, typography, logo`;
    const defaultQuality = "8k resolution, highly detailed, unreal engine 5 render";

    return `/imagine prompt: ${core}, ${details}${defaultQuality} ${params}`;
};

export const generateThumbnailPrompt = (
    topic: string,
    emotion: string,
    composition: string,
    textSpace: boolean,
    srefUrl: string = ''
): string => {
    // Thumbnail Specific Logic
    let prompt = `/imagine prompt: YouTube Thumbnail for "${topic}", `;

    if (emotion) prompt += `featuring ${emotion} expression, `;
    if (composition) prompt += `${composition} composition, `;
    if (textSpace) prompt += `composition with empty negative space on the side for text placement, `;

    prompt += `eye-catching, viral style, 4k resolution, highly detailed, vivid colors --ar 16:9 --v 6.0`;

    // v9.0 Style Reference
    if (srefUrl) {
        prompt += ` --sref ${srefUrl} --sw 100`;
    }

    // v8.0 Clean Feed
    prompt += ` --no text, font, typography, watermark, letters, signature`;

    return prompt;
};

export const generateGeminiThumbnailPrompt = (
    topic: string,
    emotion: string,
    composition: string,
    textSpace: boolean
): string => {
    // Gemini (Imagen 3) Optimized Prompt
    // Focus on natural language description and explicit constraints.

    let prompt = `Create a high-quality YouTube thumbnail image for a video about "${topic}".\n\n`;

    prompt += `[Visual Details]\n`;
    if (emotion) prompt += `- The main subject should express a "${emotion}" emotion.\n`;
    if (composition) prompt += `- Use a "${composition}" composition style.\n`;
    if (textSpace) prompt += `- IMPORTANT: Leave empty negative space on one side of the image to allow for text placement in post-production. Do not fill the entire frame.\n`;

    prompt += `\n[Style]\n`;
    prompt += `- 4K resolution, hyper-realistic, vivid colors, eye-catching viral style.\n`;

    prompt += `\n[Constraints]\n`;
    prompt += `- Do NOT include any text, words, logos, or letters in the image. The image must be text-free.\n`;

    return prompt;
};

export const generateVeoExpertPrompt = (
    description: string,
    cameraMove: string,
    resolution: '1080p' | '4k',
    useAudio: boolean,
    lighting: string = '',
    mood: string = '',
    refData: ReferenceData | null = null // v4.0 New Param
): string => {
    const core = wrapForAsset(description, 'video');

    let details = '';
    if (lighting) details += `${lighting} lighting, `;
    if (mood) details += `${mood} atmosphere, `;

    // v4.0 Inject Ref Data
    if (refData) {
        details += `Referencing style from: ${refData.title} -- ${refData.description}, `;
    }

    let prompt = `[Video Prompt]
Concept: ${core}
Style/Details: ${details}
Camera Movement: ${cameraMove}
Quality: ${resolution}, fluid motion, high temporal coherence, professional color grading.
Constraint: Do NOT display any text, subtitles, captions, or typography. Keep the visual feed clean.`;

    if (useAudio) {
        prompt += `\n\n[Audio Prompt]
Soundscape: High fidelity ambient sound, matching the ${mood || 'scene'} mood.`;
    }

    return prompt;
};
