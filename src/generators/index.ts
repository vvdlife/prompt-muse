export type Platform = 'chatgpt' | 'gemini' | 'midjourney' | 'veo3';

export interface PromptResult {
    platform: Platform;
    content: string;
}

// ------------------------------------------------------------------
// 1. Storyboard Logic (ChatGPT / Gemini)
// ------------------------------------------------------------------

export const generateStoryboardPrompt = (
    platform: 'chatgpt' | 'gemini',
    topic: string,
    genre: string,
    duration: string,
    language: 'ko' | 'en' = 'ko'
): string => {
    const role = language === 'ko'
        ? '당신은 전문 영화 감독이자 시나리오 작가입니다.'
        : 'You are a professional film director and screenwriter.';

    const task = language === 'ko'
        ? `다음 주제를 바탕으로 촬영을 위한 완벽한 영상 콘티(Storyboard)를 작성해주세요.`
        : `Create a perfect video storyboard for filming based on the following topic.`;

    const context = `
  - 주제(Topic): ${topic}
  - 장르(Genre): ${genre}
  - 예상 길이(Duration): ${duration}
  `;

    const constraints = language === 'ko'
        ? `
    1. 표(Table) 형식을 사용하여 출력하세요.
    2. 컬럼 구성: [씬 번호] | [화면 묘사] | [오디오/대사] | [카메라 워킹] | [예상 시간]
    3. '화면 묘사'는 시각적으로 매우 구체적이어야 합니다.
    4. '카메라 워킹'은 전문 용어(Drone pan, Close-up, Dolly zoom 등)를 사용하세요.
    5. 마지막에는 각 씬을 AI 이미지/비디오 생성기로 만들기 위한 '장면별 영문 키워드 요약'을 덧붙여주세요.
    `
        : `
    1. Use a Table format.
    2. Columns: [Scene #] | [Visual Description] | [Audio/Dialogue] | [Camera Movement] | [Duration]
    3. Visual descriptions must be extremely specific.
    4. Use professional camera terms (Drone pan, Close-up, Dolly zoom, etc.).
    5. At the end, provide a 'English Keyword Summary per Scene' for AI generation.
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
Markdown Table
`;
};

// ------------------------------------------------------------------
// 2. Asset Logic (Midjourney / Veo3)
// ------------------------------------------------------------------

// Simulated "Smart Translation" wrapper
const wrapForAsset = (input: string, type: 'image' | 'video'): string => {
    // In a real app, this would call a translation API.
    // Here, we maintain the Korean input but wrap it strongly with English descriptors
    // to ensure the AI "gets the vibe" even if it processes mixed language.
    // OR we assume users might input mixed text.
    // Ideally, users should write simple English, but if they write Korean,
    // Veo/MJ might struggle slightly, but modern models are okay.
    // We will simply pass it through but add STRONG English styling keywords.
    return input;
};

export const generateMidjourneyExpertPrompt = (
    description: string,
    ar: string, // e.g., '16:9'
    stylize: number, // 0-1000
    weird: number // 0-3000
): string => {
    const core = wrapForAsset(description, 'image');
    const params = `--ar ${ar} --stylize ${stylize} --weird ${weird} --q 2 --v 6.0`;

    // Expert keywords injection
    const qualityKeywords = "8k resolution, photorealistic, cinematic lighting, highly detailed, unreal engine 5 render, global illumination";

    return `/imagine prompt: ${core}, ${qualityKeywords} ${params}`;
};

export const generateVeoExpertPrompt = (
    description: string,
    camera: string,
    resolution: '1080p' | '4k',
    useAudio: boolean
): string => {
    const core = wrapForAsset(description, 'video');

    let prompt = `[Video Prompt]
Concept: ${core}
Camera Movement: ${camera}
Quality: ${resolution}, fluid motion, high temporal coherence, consistent texture, professional color grading.`;

    if (useAudio) {
        prompt += `\n\n[Audio Prompt]
Soundscape: High fidelity ambient sound, matching the visual mood, clear and distinct SFX.`;
    }

    return prompt;
};
