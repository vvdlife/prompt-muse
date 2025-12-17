

/**
 * v2.0 Professional Core Renewal: Thumbnail Strategy
 * 
 * 1. Midjourney: Precision control, style references logic.
 * 2. Gemini (NanoBanana): Natural language, text allowance, image override.
 */

export const generateThumbnailPrompt = (
    topic: string,
    emotion: string,
    composition: string,
    textSpace: boolean,
    srefUrl: string = ''
): string => {
    // Midjourney Specific Logic (v6.0 Strategy)
    let prompt = `/imagine prompt: YouTube Thumbnail for "${topic}", `;

    if (emotion) prompt += `featuring ${emotion} expression, `;
    if (composition) prompt += `${composition} composition, `;
    if (textSpace) prompt += `composition with empty negative space on the side for text placement, `;

    prompt += `eye-catching, viral style, 4k resolution, highly detailed, vivid colors --ar 16:9 --v 6.0`;

    // v9.0 Style Reference Integration
    if (srefUrl) {
        prompt += ` --sref ${srefUrl} --sw 100`;
    }

    // v8.0 Clean Feed (Midjourney CANNOT do text well, so we enforce no text)
    prompt += ` --no text, font, typography, watermark, letters, signature`;

    return prompt;
};

export const generateGeminiThumbnailPrompt = (
    topic: string,
    emotion: string,
    composition: string,
    textSpace: boolean,
    hasRefImage: boolean = false
): string => {
    // Gemini (Imagen 3 / NanoBanana) Optimized Prompt
    // v2.0 Update: FULL support for Text & Image Override.

    let prompt = `Create a high-quality YouTube thumbnail image for a video about "${topic}".\n\n`;

    // v12.0/v2.0 Image Supremacy: Absolute Override
    if (hasRefImage) {
        prompt += `[Style Reference - PRIMARY]\n`;
        prompt += `- I have attached a reference image. This is the **ABSOLUTE STYLE GUIDE**.\n`;
        prompt += `- IGNORE all standard composition rules. MIMIC the attached image's layout, color palette, and font style exactly.\n`;
        prompt += `- Apply the Attached Image's style to the new topic: "${topic}".\n`;
        prompt += `- You MAY include bold, readable text (Korean or English) if the reference image uses text. Match the font vibe.\n`;

        return prompt; // Early return for "Image Supremacy" (Professional Mode)
    }

    // Standard Mode (No Image, just Text Prompts)
    prompt += `[Visual Details]\n`;
    if (emotion) prompt += `- The main subject should express a "${emotion}" emotion.\n`;
    if (composition) prompt += `- Use a "${composition}" composition style.\n`;
    if (textSpace) prompt += `- Leave empty negative space on one side for potential text placement.\n`;

    prompt += `\n[Style]\n`;
    prompt += `- 4K resolution, hyper-realistic, vivid colors, eye-catching viral style.\n`;

    prompt += `\n[Text & Typography]\n`;
    prompt += `- You MAY include bold, exciting Korean (Hangul) or English text if it enhances the viral appeal.\n`;
    prompt += `- If inserting text, ensure high contrast and professional typography (e.g., Sans-serif, Impact style).\n`;

    return prompt;
};
