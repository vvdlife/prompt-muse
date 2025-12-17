import React, { useState } from 'react';
import { generateStoryboardPrompt } from '../../generators';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface StoryboardModeProps {
    platform: 'chatgpt' | 'gemini';
}

export const StoryboardMode: React.FC<StoryboardModeProps> = ({ platform }) => {
    // Core
    const [topic, setTopic] = useState('');
    const [genre, setGenre] = useState('');
    const [duration, setDuration] = useState('');

    // Advanced (v3.0)
    const [mood, setMood] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [characters, setCharacters] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        const prompt = generateStoryboardPrompt(
            platform,
            topic,
            genre,
            duration,
            mood,
            targetAudience,
            characters,
            'ko'
        );
        setResult(prompt);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
            <h3 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                {platform === 'gemini' ? 'Gemini' : 'ChatGPT'} 영상 콘티 작가 모드
            </h3>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Core Inputs */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>영상 주제 (Core Topic)</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="예: 부산행 같은 좀비 아포칼립스 생존기"
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>장르 (Genre)</label>
                        <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="예: SF 스릴러"
                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>예상 길이 (Duration)</label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="예: 30초, 3분"
                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)' }}
                        />
                    </div>
                </div>

                {/* Advanced Inputs Accordion */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontWeight: 600 }}>✨ 디테일 설정 (Mood, Characters...)</span>
                        {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showAdvanced && (
                        <div style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>분위기 (Mood)</label>
                                <select
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                                >
                                    <option value="">선택안함 (기본)</option>
                                    <option value="희망찬 (Hopeful)">희망찬 (Hopeful)</option>
                                    <option value="긴박한 (Thriller)">긴박한 (Thriller)</option>
                                    <option value="우울한 (Noir)">우울한 (Noir)</option>
                                    <option value="몽환적인 (Dreamy)">몽환적인 (Dreamy)</option>
                                    <option value="유머러스한 (Comedic)">유머러스한 (Comedic)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>타겟 오디언스 (Target Audience)</label>
                                <input
                                    type="text"
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="예: 20대 직장인, 투자자"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>주요 등장인물 (Key Characters)</label>
                                <input
                                    type="text"
                                    value={characters}
                                    onChange={(e) => setCharacters(e.target.value)}
                                    placeholder="예: 30대 남성 형사, 5세 여아"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'black',
                        fontWeight: 'bold',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginTop: '0.5rem',
                        boxShadow: 'var(--glow-primary)'
                    }}
                >
                    {platform === 'gemini' ? 'Gemini' : 'ChatGPT'} 콘티 프롬프트 생성
                </button>

                {result && (
                    <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#aaa' }}>
                            <span>생성된 전문가 프롬프트</span>
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
                                height: '300px',
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
