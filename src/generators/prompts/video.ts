import type { ReferenceData } from '../core';

const wrapForAsset = (input: string, _type: 'image' | 'video'): string => {
    return input;
};

export const generateVeoExpertPrompt = (
    description: string,
    shotFunction: string, // v2.5 Copilot: Replaces 'cameraMove'
    resolution: '1080p' | '4k',
    useAudio: boolean,
    useAudio: boolean,
    lighting: string = '',
    mood: string = '',
    customInstruction: string = '', // v2.7 User Override
    refData: ReferenceData | null = null
): string => {
    // v2.5 EXPERT PD MODE: B-ROLL DIRECTOR
    // Map "Director's Intent" (Shot Function) to "Technical Camera Movements"
    let technicalCamera = '';
    switch (shotFunction) {
        case 'Establishing Shot':
            technicalCamera = 'Wide angle, slow pan, high angle drone shot, establishing the environment';
            break;
        case 'Detail Texture':
            technicalCamera = 'Macro lens, extreme close-up, shallow depth of field, slow rack focus';
            break;
        case 'Reaction/Emotion':
            technicalCamera = 'Medium close-up, handheld camera movement, focus on facial expression';
            break;
        case 'Action/Transition':
            technicalCamera = 'Fast tracking shot, motion blur, dynamic whip pan';
            break;
        default:
            technicalCamera = 'Cinematic smooth motion, 24fps';
    }

    const core = wrapForAsset(description, 'video');

    let details = '';
    if (lighting) details += `${lighting} lighting, `;
    if (mood) details += `${mood} atmosphere, `;

    // v4.0 Inject Ref Data
    if (refData) {
        details += `Referencing style from: ${refData.title} -- ${refData.description}, `;
    }

    // v2.7 Inject Custom Instruction
    if (customInstruction) {
        details += `\nCRITICAL USER INSTRUCTION: ${customInstruction}`;
    }

    let prompt = `[Video Prompt - B-Roll Director Mode]
Concept: ${core}
Visual Context: ${details}
Camera Strategy: ${technicalCamera} (Intent: ${shotFunction})
Quality: ${resolution}, fluid motion, high temporal coherence, professional color grading, cinematic lighting.
Constraint: Do NOT display any text, subtitles, captions, or typography. Keep the visual feed clean.`;

    if (useAudio) {
        prompt += `\n\n[Audio Prompt]
Soundscape: High fidelity ambient sound, matching the ${mood || 'scene'} mood (No speech/dialogue).`;
    }

    return prompt;
};
