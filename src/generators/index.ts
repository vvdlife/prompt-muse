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
    // v3.0 New Params
    mood: string = '',
    targetAudience: string = '',
    characters: string = '',
    language: 'ko' | 'en' = 'ko'
): string => {
    const role = language === 'ko'
        ? '당신은 전문 영화 감독이자 시나리오 작가입니다.'
        : 'You are a professional film director and screenwriter.';

    let context = `
  - 주제(Topic): ${topic}
  - 장르(Genre): ${genre}
  - 예상 길이(Duration): ${duration}
  `;

    if (mood) context += `- 분위기(Mood): ${mood}\n  `;
    if (targetAudience) context += `- 타겟 오디언스(Target Audience): ${targetAudience}\n  `;
    if (characters) context += `- 주요 등장인물(Key Characters): ${characters}\n  `;

    const task = language === 'ko'
        ? `위 정보를 바탕으로 촬영을 위한 완벽한 영상 콘티(Storyboard)를 작성해주세요.`
        : `Create a perfect video storyboard based on the info above.`;

    const constraints = language === 'ko'
        ? `
    1. 표(Table) 형식을 사용하여 출력하세요.
    2. 컬럼 구성: [씬 번호] | [화면 묘사] | [오디오/대사] | [카메라 워킹] | [예상 시간]
    3. '화면 묘사'는 시각적으로 매우 구체적이어야 하며, 설정된 분위기(${mood || '기본'})를 반영해야 합니다.
    4. '카메라 워킹'은 전문 용어(Drone pan, Close-up, Dolly zoom 등)를 사용하세요.
    5. 마지막에는 각 씬을 AI 이미지/비디오 생성기로 만들기 위한 '장면별 영문 키워드 요약'을 덧붙여주세요.
    `
        : `
    ... (English constraints omitted for brevity, assuming KO main) ...
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

const wrapForAsset = (input: string, _type: 'image' | 'video'): string => {
    return input;
};

export const generateMidjourneyExpertPrompt = (
    description: string,
    ar: string,
    stylize: number,
    weird: number,
    // v3.0 New Params
    lighting: string = '',
    camera: string = '', // Lens/Shot
    color: string = '',
    texture: string = ''
): string => {
    const core = wrapForAsset(description, 'image');

    // Construct keywords from details
    let details = '';
    if (lighting) details += `${lighting}, `;
    if (camera) details += `${camera}, `;
    if (color) details += `${color} color palette, `;
    if (texture) details += `${texture}, `;

    const params = `--ar ${ar} --stylize ${stylize} --weird ${weird} --q 2 --v 6.0`;
    const defaultQuality = "8k resolution, highly detailed, unreal engine 5 render";

    return `/imagine prompt: ${core}, ${details}${defaultQuality} ${params}`;
};

export const generateVeoExpertPrompt = (
    description: string,
    cameraMove: string, // Movement
    resolution: '1080p' | '4k',
    useAudio: boolean,
    // v3.0 New Params
    lighting: string = '',
    mood: string = ''
): string => {
    const core = wrapForAsset(description, 'video');

    let details = '';
    if (lighting) details += `${lighting} lighting, `;
    if (mood) details += `${mood} atmosphere, `;

    let prompt = `[Video Prompt]
Concept: ${core}
Style/Details: ${details}
Camera Movement: ${cameraMove}
Quality: ${resolution}, fluid motion, high temporal coherence, professional color grading.`;

    if (useAudio) {
        prompt += `\n\n[Audio Prompt]
Soundscape: High fidelity ambient sound, matching the ${mood || 'scene'} mood.`;
    }

    return prompt;
};
