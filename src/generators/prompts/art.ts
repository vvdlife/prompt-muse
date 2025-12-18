import type { ReferenceData } from '../core';

// Helper for asset wrapping
const wrapForAsset = (input: string, _type: 'image' | 'video'): string => {
    return input;
};

export const generateMidjourneyExpertPrompt = (
    description: string,
    model: string, // v14.0 Selection (e.g. "v7.2")
    // Midjourney Params (now re-purposed for Channel Asset logic internally if needed, or passed from UI)
    ar: string,
    stylize: number,
    weird: number,
    lighting: string = '',
    lens: string = '', // v3.0: Replaces 'channelPreset'
    color: string = '',
    texture: string = '',
    customInstruction: string = '', // v2.7 User Override
    refData: ReferenceData | null = null,
    cref: string = '',
    cw: number = 100,
    sref: string = '',
    sw: number = 1000
): string => {
    // v2.5 EXPERT PD MODE: CHANNEL CONSULTANT
    // Apply Lens/Style Presets
    let lensGuide = '';
    if (lens) {
        lensGuide = `${lens} lens`;
        if (lens.includes('Wide')) lensGuide += ', expansive field of view, distortion at edges';
        if (lens.includes('Telephoto')) lensGuide += ', compressed background, bokeh effect, isolation of subject';
        if (lens.includes('Macro')) lensGuide += ', extreme close-up, visible textures, sharp focus';
        if (lens.includes('Fisheye')) lensGuide += ', spherical distortion, ultra-wide dynamic perspective';
        if (lens.includes('35mm')) lensGuide += ', cinematic film look, natural perspective, analog feel';
    } else {
        lensGuide = 'High quality professional photography, 50mm standard lens';
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

    // v2.7 Inject Custom Instruction
    if (customInstruction) {
        details += ` ${customInstruction}, `;
    }

    // Combine Core + Lens Preset + Details
    const finalPrompt = `${core}, ${lensGuide}, ${details}`;

    // Parse model string to get version tag (Simple heuristic)
    // "v7.2 (Photorealism)" -> "--v 7.2"
    // "Niji 7" -> "--nji 7"
    let versionParam = '--v 6.0'; // Fallback
    if (model.includes('Niji')) {
        const nijiVer = model.match(/\d+(\.\d+)?/)?.[0] || '6';
        versionParam = `--nji ${nijiVer}`;
    } else {
        const vVer = model.match(/v(\d+(\.\d+)?)/i)?.[1] || '6.0';
        versionParam = `--v ${vVer}`;
    }

    let consistency = '';
    if (cref) consistency += ` --cref ${cref} --cw ${cw}`;
    if (sref) consistency += ` --sref ${sref} --sw ${sw}`;

    const params = `--ar ${ar} --stylize ${stylize} --weird ${weird} --q 2 ${versionParam} ${consistency} --no text, watermark, signature, letters, typography, logo`;
    const defaultQuality = "8k resolution, highly detailed, unreal engine 5 render";

    return `/imagine prompt: ${finalPrompt} ${defaultQuality} ${params}`;
};
