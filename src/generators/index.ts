export type Platform = 'chatgpt' | 'midjourney' | 'veo3';

export interface PromptResult {
    platform: Platform;
    content: string;
    metadata?: Record<string, string>;
}

// Helper to escape XML
const escapeXml = (unsafe: string) => unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
    }
});

export const generateChatGPTPrompt = (concept: string, style: string): string => {
    // Chain of Thought & XML Structure for "Expert" output
    const tone = style === 'corporate' ? 'Professional, Concise' : 'Creative, Descriptive';

    return `<prompt>
  <role>Expert Content Creator & Prompt Engineer</role>
  <context>
    User wants to generate content based on the concept: "${escapeXml(concept)}".
    The desired style is: ${style}.
  </context>
  <task>
    1. Analyze the concept deeply.
    2. Expand it into a full narrative or detailed description.
    3. Maintain a ${tone} tone throughout.
  </task>
  <constraints>
    <item>Use Markdown formatting for readability.</item>
    <item>Avoid generic clichés.</item>
    <item>Provide 3 distinct variations.</item>
  </constraints>
  <output_format>Markdown</output_format>
</prompt>`;
};

export const generateMidjourneyPrompt = (concept: string, style: string): string => {
    let params = '--v 6.0 --q 2';
    let keywords = '';

    switch (style) {
        case 'cinematic':
            keywords = 'cinematic lighting, anamorphic lens, 85mm f/1.8, global illumination, unreal engine 5 render, hyper-detailed';
            params += ' --ar 16:9 --stylize 250';
            break;
        case 'photorealistic':
            keywords = '8k resolution, raw photo, fujifilm xt-4, sharp focus, ray tracing, octane render';
            params += ' --ar 3:2 --stylize 100';
            break;
        case 'anime':
            keywords = 'studio ghibli style, makoto shinkai style, vibrant colors, detailed background, 2d cel shading';
            params += ' --niji 6 --ar 16:9';
            break;
        case 'dark-fantasy':
            keywords = 'dark fantasy, elden ring style, volumetric fog, ominous atmosphere, detailed textures, baroque';
            params += ' --ar 2:3 --chaos 20 --stylize 500';
            break;
        default:
            keywords = 'high quality, detailed';
            params += ' --ar 1:1';
    }

    return `/imagine prompt: ${concept}, ${keywords} ${params}`;
};

export const generateVeoPrompt = (concept: string, style: string): string => {
    // Veo 3 Specifics: Camera Control, Motion, Audio
    let camera = '';
    let audio = '';

    switch (style) {
        case 'cinematic':
            camera = 'Cinematic drone shot, slow pan to right, rack focus on subject';
            audio = 'Epic orchestral score, deep bass hits, ambient wind';
            break;
        case 'anime':
            camera = 'Dynamic camera movement, fast zoom in, speed lines';
            audio = 'Upbeat synthesizer music, sharp sound effects';
            break;
        case 'photorealistic':
            camera = 'Steadycam shot, following subject, shallow depth of field';
            audio = 'Realistic city ambience, footsteps on pavement, distant car horns';
            break;
        default:
            camera = 'Static wide shot, high resolution';
            audio = 'Subtle background music';
    }

    // Structured for Veo (simulated based on typical video gen prompt structure)
    return `[Video Prompt]
Concept: ${concept}
Style: ${style}
Camera Movement: ${camera}
Refinements: 4k resolution, fluid motion, high temporal coherence, consistent lighting.

[Audio Prompt]
Soundscape: ${audio}`;
};

export const generateAllPrompts = (concept: string, style: string): PromptResult[] => {
    return [
        { platform: 'chatgpt', content: generateChatGPTPrompt(concept, style) },
        { platform: 'midjourney', content: generateMidjourneyPrompt(concept, style) },
        { platform: 'veo3', content: generateVeoPrompt(concept, style) },
    ];
};
