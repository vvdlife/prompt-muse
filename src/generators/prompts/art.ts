import type { ReferenceData } from '../core';

// Helper for asset wrapping
const wrapForAsset = (input: string, _type: 'image' | 'video'): string => {
    return input;
};

export const generateMidjourneyExpertPrompt = (
    description: string,
    // Midjourney Params (now re-purposed for Channel Asset logic internally if needed, or passed from UI)
    ar: string,
    stylize: number,
    weird: number,
    lighting: string = '',
    channelPreset: string = '', // v2.5: Replaces 'camera' input
    color: string = '',
    texture: string = '',
    refData: ReferenceData | null = null
): string => {
    // v2.5 EXPERT PD MODE: CHANNEL CONSULTANT
    // Apply Channel Branding Presets
    let styleGuide = '';
    switch (channelPreset) {
        case 'Tech / Minimal':
            styleGuide = 'Minimalist, clean Apple-like aesthetic, matte finish, soft studio lighting, white and grey tones';
            break;
        case 'Gaming / Neon':
            styleGuide = 'Cyberpunk vivid colors, high contrast, neon glow, dynamic energy, esports style';
            break;
        case 'Lifestyle / Cozy':
            styleGuide = 'Warm film grain, natural sunlight, kinfolk magazine style, soft focus, pastel tones';
            break;
        default:
            styleGuide = 'High quality professional photography';
    }

    const core = wrapForAsset(description, 'image');

    let details = '';
    if (lighting) details += `${lighting}, `;
    if (color) details += `${color} color palette, `;
    if (texture) details += `${texture}, `;

    // v4.0 Inject Ref Data for styling
    if (refData) {
        details += `in the style of ${refData.title} (${refData.keywords}), `;
    }

    // Combine Core + Channel Preset + Details
    const finalPrompt = `${core}, ${styleGuide}, ${details}`;

    const params = `--ar ${ar} --stylize ${stylize} --weird ${weird} --q 2 --v 6.0 --no text, watermark, signature, letters, typography, logo`;
    const defaultQuality = "8k resolution, highly detailed, unreal engine 5 render";

    return `/imagine prompt: ${finalPrompt} ${defaultQuality} ${params}`;
};
