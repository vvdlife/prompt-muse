

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
    // [Task: Youtube Extraction] Create src/utils/youtube.ts for YouTube URL parsing and thumbnail generation <!-- id: 0 -->
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
    // v2.1 Expert PD Strategy: Step-by-Step Structured Prompting
    // We break down the instruction into clear, logical phases for the AI.

    if (hasRefImage) {
        return `
*** MISSION: HIGH-CTR YOUTUBE THUMBNAIL REMIX ***

[PHASE 1: EXPERT ANALYSIS (DECONSTRUCTION)]
You are a World-Class YouTube Art Director & Data Analyst.
I have provided a Reference Image that has a proven "Winning Formula" for high views.
Analyze this image precisely into the following components:
1. **Composition**: Where is the subject placed? Where is the text? Is it a close-up or wide shot?
2. **Color Psychology**: What are the dominant colors? (e.g., High contrast Yellow/Red for urgency?)
3. **Typography DNA**: Analyze the font weight, stroke, shadow, and color.
4. **The Hook**: What is the key visual tension?

[PHASE 2: ADAPTIVE REMIXING (THE BRIDGE)]
Now, you must transplant this "Winning Formula" into a completely new context.
- **Source Style**: The Reference Image provided.
- **Target Topic**: "${topic}"
- **Target Emotion**: "${emotion}"

**INSTRUCTION RULES:**
- **KEEP (The Skeleton)**: You MUST preserve the exact Layout, Camera Angle, Lighting Style, and Font Design of the reference.
- **CHANGE (The Skin)**: Replace the actual subject and objects to match the new topic: "${topic}".
- **TEXT**: If the reference has text, replace it with English or Korean text relevant to "${topic}". Match the font style perfectly.

[PHASE 3: FINAL PRODUCTION GUIDE]
Generate the final image with these specific directives:
- **Main Subject**: A central figure or object representing "${topic}", posing with "${emotion}" emotion, placed exactly where the subject is in the reference.
- **Background**: Relevant to "${topic}" but maintaining the same blur/focus ratio as the reference.
- **Quality**: 8K Display, Hyper-realistic, Unreal Engine 5 Render, Ray Tracing, Vivid Colors.
- **Negative Prompts**: Do not simply copy the pixels. Do not make the text messy. Do not deform hands/faces.

[EXECUTE NOW]
Create the definitive thumbnail for "${topic}" using the reference's DNA.
`.trim();
    }

    // Standard Mode (No Reference Image) - Still structured
    return `
*** MISSION: BEST-IN-CLASS VIRAL THUMBNAIL ***

[PHASE 1: VISUAL PLANNING]
You are designing a thumbnail for the topic: "${topic}".
- **Core Emotion**: ${emotion || 'Excited and Shocked'}
- **Composition**: ${composition || 'Rule of Thirds'}
- **Negative Space**: ${textSpace ? 'Required on the side for text overlay' : 'Balanced'}

[PHASE 2: SCENE DESCRIPTION]
1. **Subject**: A high-quality, expressive subject appropriate for "${topic}".
2. **Action**: Dynamic movement or strong facial expression conveying "${emotion}".
3. **Lighting**: Professional Studio Lighting, Rim Lighting (Backlight) to separate subject from background.

[PHASE 3: STYLE & RENDER]
- **Style**: Viral YouTube Style (Vivid Saturation, High Contrast, Sharp Details).
- **Tech Specs**: 8K Resolution, Hyper-realism, Cinema 4D Render style.
- **Text**: You MAY include bold, short text (English/Korean) if it fits the composition. Use Impact-style bold fonts.

Create this image now.
`.trim();
};
