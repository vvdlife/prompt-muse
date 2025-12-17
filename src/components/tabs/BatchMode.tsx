import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

export const BatchMode: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const generateWeeklyStrategyPrompt = (topic: string) => {
        return `
# Weekly Content Strategy: "One-Source Multi-Use" (OSMU) Agent Role

You are a professional Content Strategist & YouTube PD.
Your goal is to maximize the output of a single topic by creating a coherent schedule of 1 Long-form video (Main) and 3 Short-form videos (Derivatives).

## Input Topic
"${topic}"

## Task
Create a detailed content plan and script outlines for the following 4 videos:

### 1. Long-form Video (Main) - "Deep Dive"
- **Purpose**: Authority building, deep engagement, high retention.
- **Format**: 16:9, 8-12 minutes.
- **Tone**: Professional, informative, analytical.
- **Output Required**: 
    - Title Candidates (3 viral hooks)
    - Thumbnail Concept (Visual description)
    - Structure Outline (Intro -> Body Points -> Conclusion)

### 2. Short-form 1 (Derivative) - "The Hook/Highlight"
- **Purpose**: Extract the most shocking/interesting fact from the Main video to drive traffic.
- **Format**: 9:16, <60s, Fast paced.
- **Output Required**: 60s Script with visual cues.

### 3. Short-form 2 (derivative) - "The How-To/Tip"
- **Purpose**: Actionable value. A quick tip related to the topic.
- **Format**: 9:16, <60s.
- **Output Required**: Step-by-step Script (Problem -> Solution).

### 4. Short-form 3 (Derivative) - "The Behind-the-Scenes / Controversy"
- **Purpose**: Engagement, comments, relatable content.
- **Format**: 9:16, <60s.
- **Output Required**: Script focusing on a common misconception or "Real Talk".

## Execution Instruction
Provide the output in a structured format (Markdown) that I can immediately use to film.
`;
    };

    const handleGenerate = () => {
        const prompt = generateWeeklyStrategyPrompt(topic);
        setResult(prompt);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
            <h3 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles color="var(--color-secondary)" /> 주간 기획 매니저 (Weekly Batch)
            </h3>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                하나의 주제로 <strong>롱폼 1개 + 쇼츠 3개</strong>의 기획안을 한 번에 생성합니다. (OSMU 전략)
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>이번 주 메인 주제 (Main Topic)</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="예: 아이폰 16 언박싱 및 리뷰"
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)', fontSize: '1.1rem' }}
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!topic}
                    style={{
                        backgroundColor: 'var(--color-accent, #ff00ff)',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '1.2rem',
                        borderRadius: '8px',
                        marginTop: '0.5rem',
                        boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
                        cursor: topic ? 'pointer' : 'not-allowed',
                        opacity: topic ? 1 : 0.5,
                        fontSize: '1.1rem'
                    }}
                >
                    🚀 주간 콘텐츠 기획안 생성 (1 Long + 3 Shorts)
                </button>

                {result && (
                    <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#aaa' }}>
                            <span>생성된 기획 프롬프트 (ChatGPT/Gemini에 붙여넣기)</span>
                            <button
                                onClick={handleCopy}
                                style={{ display: 'flex', gap: '0.5rem', color: copied ? 'var(--color-primary)' : 'white' }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? '복사됨!' : '복사하기'}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={result}
                            style={{
                                width: '100%',
                                height: '400px',
                                padding: '1rem',
                                borderRadius: '8px',
                                background: 'rgba(0,0,0,0.3)',
                                color: '#e0e0e0',
                                fontFamily: 'monospace',
                                lineHeight: '1.5'
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
