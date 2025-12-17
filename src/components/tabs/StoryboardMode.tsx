import React, { useState } from 'react';
import { generateStoryboardPrompt, type ReferenceData } from '../../generators';
import { Copy, Check, ChevronDown, ChevronUp, Link as LinkIcon, Loader2 } from 'lucide-react';

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

    // URL Grounding (v4.0)
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [refData, setRefData] = useState<ReferenceData | null>(null);

    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    // Analyze URL Function
    const handleAnalyzeUrl = async () => {
        if (!url) return;
        setIsAnalyzing(true);

        try {
            // Check environment (Local Dev workaround vs Vercel Prod)
            // In local dev without 'vercel dev', /api won't work. We mock it for demonstration.
            const isLocalhost = window.location.hostname === 'localhost';

            let data;
            if (isLocalhost && !import.meta.env.VITE_VERCEL_ENV) {
                // Mock fetch for local dev review
                await new Promise(r => setTimeout(r, 1500));
                data = {
                    success: true,
                    data: {
                        title: "Example Scifi Article",
                        description: "A detailed analysis of cyberpunk trends in 2024.",
                        keywords: "cyberpunk, neon, 2024, ai trend"
                    }
                };
            } else {
                const res = await fetch('/api/analyze-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });
                data = await res.json();
            }

            if (data.success) {
                setRefData({ url, ...data.data });
            } else {
                alert('URL 분석 실패: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('분석 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerate = () => {
        const prompt = generateStoryboardPrompt(
            platform,
            topic,
            genre,
            duration,
            mood,
            targetAudience,
            characters,
            refData, // Pass refData
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

                {/* v4.0 URL Reference Input */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>참고 자료 URL (Reference Grounding)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="예: https://website.com/article (기사, 블로그 등)"
                            style={{ flex: 1, padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)' }}
                        />
                        <button
                            onClick={handleAnalyzeUrl}
                            disabled={isAnalyzing || !url}
                            style={{
                                padding: '0 1.5rem',
                                borderRadius: '8px',
                                background: 'var(--color-secondary)',
                                color: 'black',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: url ? 'pointer' : 'not-allowed',
                                opacity: url ? 1 : 0.5
                            }}
                        >
                            {isAnalyzing ? <Loader2 size={18} className="spin" /> : <LinkIcon size={18} />}
                            {isAnalyzing ? '분석 중...' : 'URL 분석'}
                        </button>
                    </div>

                    {/* Analyzed Data Preview */}
                    {refData && (
                        <div style={{ marginTop: '0.5rem', padding: '0.8rem', borderRadius: '6px', background: 'rgba(0,255,136,0.1)', border: '1px solid var(--color-primary)', fontSize: '0.9rem', color: '#ddd' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>✅ 분석 완료: {refData.title}</div>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8 }}>{refData.description}</div>
                        </div>
                    )}
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
            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};
