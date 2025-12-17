export type Platform = 'chatgpt' | 'gemini' | 'midjourney' | 'veo3';

export interface PromptResult {
    platform: Platform;
    content: string;
}

export interface ReferenceData {
    url: string;
    title: string;
    description: string;
    keywords: string;
}

// ------------------------------------------------------------------
// 1. Storyboard Logic (ChatGPT / Gemini)
// ------------------------------------------------------------------

export const generateStoryboardPrompt = (
    platform: 'chatgpt' | 'gemini',
    topic: string,
    genre: string,
    duration: string,
    mood: string = '',
    targetAudience: string = '',
    characters: string = '',
    refData: ReferenceData | null = null, // v4.0 New Param
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

    // v4.0 URL Reference Injection
    if (refData && refData.url) {
        context += `
  - 참고 자료(Reference Source):
    - URL: ${refData.url}
    - 제목: ${refData.title}
    - 핵심 요약: ${refData.description}
    - 키워드: ${refData.keywords}
    `;
    }

    const task = language === 'ko'
        ? `위 정보를 바탕으로 촬영을 위한 완벽한 영상 콘티(Storyboard)를 작성해주세요.`
        : `Create a perfect video storyboard based on the info above.`;

    const constraints = language === 'ko'
        ? `
    1. 표(Table) 형식을 사용하여 출력하세요.
    2. 컬럼 구성: [씬 번호] | [화면 묘사] | [오디오/대사] | [카메라 워킹] | [예상 시간]
    3. '화면 묘사'는 시각적으로 매우 구체적이어야 하며, 설정된 분위기(${mood || '기본'})를 반영해야 합니다.
    4. '카메라 워킹'은 전문 용어(Drone pan, Close-up, Dolly zoom 등)를 사용하세요.
    ${refData ? `5. [중요] 참고 자료의 내용과 스타일을 적극적으로 시나리오에 반영하세요.` : ''}
    6. 마지막에는 각 씬을 AI 이미지/비디오 생성기로 만들기 위한 '장면별 영문 키워드 요약'을 덧붙여주세요.
    `
        : `...`;

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
    lighting: string = '',
    camera: string = '',
    color: string = '',
    texture: string = '',
    refData: ReferenceData | null = null // v4.0 New Param
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

    const params = `--ar ${ar} --stylize ${stylize} --weird ${weird} --q 2 --v 6.0`;
    const defaultQuality = "8k resolution, highly detailed, unreal engine 5 render";

    return `/imagine prompt: ${core}, ${details}${defaultQuality} ${params}`;
};

export const generateVeoExpertPrompt = (
    description: string,
    cameraMove: string,
    resolution: '1080p' | '4k',
    useAudio: boolean,
    lighting: string = '',
    mood: string = '',
    refData: ReferenceData | null = null // v4.0 New Param
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
Quality: ${resolution}, fluid motion, high temporal coherence, professional color grading.`;

    if (useAudio) {
        prompt += `\n\n[Audio Prompt]
Soundscape: High fidelity ambient sound, matching the ${mood || 'scene'} mood.`;
    }

    return prompt;
};
