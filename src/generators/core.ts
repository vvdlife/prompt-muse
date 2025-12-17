// Core Interfaces
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
