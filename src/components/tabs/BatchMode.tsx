import React, { useState } from 'react';
import { Copy, Check, Sparkles, Settings2 } from 'lucide-react';

// v2.6 Pipeline Integration
interface BatchModeProps {
    initialTopic?: string;
    onTopicChange?: (topic: string) => void;
}

export const BatchMode: React.FC<BatchModeProps> = ({ initialTopic = '', onTopicChange }) => {
    const [topic, setTopic] = useState(initialTopic);

    // v14.0 Fine-grained Batch Controls
    const [longFormCount, setLongFormCount] = useState(1);
    const [shortFormCount, setShortFormCount] = useState(3);
    const [longFormTopics, setLongFormTopics] = useState('');
    const [shortFormTopicsList, setShortFormTopicsList] = useState<string[]>(Array(3).fill(''));
    const [showConfig, setShowConfig] = useState(false);

    // Resize topics list when count changes
    React.useEffect(() => {
        setShortFormTopicsList(prev => {
            const currentLength = prev.length;
            if (currentLength === shortFormCount) return prev;
            if (currentLength < shortFormCount) {
                return [...prev, ...Array(shortFormCount - currentLength).fill('')];
            } else {
                return prev.slice(0, shortFormCount);
            }
        });
    }, [shortFormCount]);

    // Sync local topic with parent
    const handleTopicChange = (val: string) => {
        setTopic(val);
        if (onTopicChange) onTopicChange(val);
    };
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const generateWeeklyStrategyPrompt = (topic: string) => {
        const longTopicsList = longFormTopics.split('\n').filter((t: string) => t.trim()).map((t: string) => `- Specified Topic: ${t}`).join('\n');
        const shortTopicsList = shortFormTopicsList.map((t, i) => t.trim() ? `- Short ${i + 1}: ${t}` : null).filter(Boolean).join('\n');

        return `
# Weekly Content Strategy: "One-Source Multi-Use" (OSMU) Agent Role

You are a professional Content Strategist & YouTube PD.
Your goal is to maximize the output of a single topic by creating a coherent schedule of ${longFormCount} Long-form video(s) and ${shortFormCount} Short-form video(s).

## Input Topic
"${topic}"

## Task
Create a detailed content plan and script outlines for the following videos:

### Part 1. Long-form Videos (${longFormCount} items) - "Deep Dive"
- **Purpose**: Authority building, deep engagement, high retention.
- **Format**: 16:9, 8-12 minutes.
- **Tone**: Professional, informative, analytical.
${longTopicsList ? `\n**Requested Specific Topics**:\n${longTopicsList}\n` : ''}
**Output Required per Video**:
    - Title Candidates (3 viral hooks)
    - Thumbnail Concept (Visual description)
    - Structure Outline (Intro -> Body Points -> Conclusion)

### Part 2. Short-form Videos (${shortFormCount} items) - "Viral Derivatives"
- **Purpose**: Traffic generation, reach extension.
- **Format**: 9:16, <60s, Fast paced.
${shortTopicsList ? `\n**Requested Specific Topics**:\n${shortTopicsList}\n` : ''}
**Output Required per Video**:
    - 60s Script with visual cues.
    - Hook Strategy (Visual/Audio/Negative).

## Execution Instruction
Provide the output in a structured format (Markdown) that I can immediately use to film.
**CRITICAL: All Scripts, Outlines, and Explanations MUST be written in KOREAN (한국어). Do not use English for the final content.**
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
                하나의 주제로 <strong>롱폼 {longFormCount}개 + 쇼츠 {shortFormCount}개</strong>의 기획안을 한 번에 생성합니다. (OSMU 전략)
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>이번 주 메인 주제 (Main Topic)</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        placeholder="예: 아이폰 16 언박싱 및 리뷰"
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)', fontSize: '1.1rem' }}
                    />
                </div>

                {/* Configuration Toggle */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        style={{
                            width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)', color: '#ccc', cursor: 'pointer', border: 'none'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings2 size={16} /> 상세 설정 (수량 및 개별 주제)</span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{showConfig ? '접기' : '펼치기'}</span>
                    </button>

                    {showConfig && (
                        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', display: 'grid', gap: '1.5rem' }}>
                            {/* Long Form Config */}
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>롱폼 개수</label>
                                    <input
                                        type="number" min="0" max="10"
                                        value={longFormCount}
                                        onChange={(e) => setLongFormCount(parseInt(e.target.value) || 0)}
                                        style={{ width: '100%', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>롱폼 지정 주제 (줄바꿈으로 구분, 선택사항)</label>
                                    <textarea
                                        value={longFormTopics}
                                        onChange={(e) => setLongFormTopics(e.target.value)}
                                        placeholder="예: 아이폰 16 카메라 테스트&#13;&#10;아이폰 16 vs 15 비교"
                                        style={{ width: '100%', height: '60px', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #333' }} />

                            {/* Short Form Config */}
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>쇼츠 개수</label>
                                    <input
                                        type="number" min="0" max="20"
                                        value={shortFormCount}
                                        onChange={(e) => setShortFormCount(parseInt(e.target.value) || 0)}
                                        style={{ width: '100%', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>쇼츠 개별 주제 ({shortFormCount}개)</label>
                                    <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                        {shortFormTopicsList.map((t, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                value={t}
                                                onChange={(e) => {
                                                    const newList = [...shortFormTopicsList];
                                                    newList[i] = e.target.value;
                                                    setShortFormTopicsList(newList);
                                                }}
                                                placeholder={`쇼츠 #${i + 1} 주제 입력...`}
                                                style={{ width: '100%', padding: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px', fontSize: '0.9rem' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                    🚀 주간 콘텐츠 기획안 생성 ({longFormCount} Long + {shortFormCount} Shorts)
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
