import type { ReferenceData } from '../core';

const wrapForAsset = (input: string, _type: 'image' | 'video'): string => {
    return input;
};

export const generateVeoExpertPrompt = (
    description: string,
    cameraMove: string,
    resolution: '1080p' | '4k',
    useAudio: boolean,
    lighting: string = '',
    mood: string = '',
    refData: ReferenceData | null = null
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
