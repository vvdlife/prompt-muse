import type { ReferenceData } from '../core';

// Helper for asset wrapping
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
    refData: ReferenceData | null = null
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
