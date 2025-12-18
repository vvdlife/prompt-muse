import React, { useState } from 'react';
import { generateStoryboardPrompt, type ReferenceData } from '../../generators';
import { Copy, Check, ChevronDown, ChevronUp, Link as LinkIcon, Loader2, Save, Trash2, FolderOpen } from 'lucide-react';
import { usePresets } from '../../hooks/usePresets';

interface StoryboardModeProps {
    platform: 'chatgpt' | 'gemini';
    // v2.6 Pipeline Integration
    initialTopic?: string;
    onScriptGenerate?: (script: string) => void;
}

interface StoryboardState {
    genre: string;
    duration: string;
    // v2.5 Narrative Architect State
    structure: string;
    hookStrategy: string;
}

export const StoryboardMode: React.FC<StoryboardModeProps> = ({ platform, initialTopic = '', onScriptGenerate }) => {
    // Core (Initialize with Global Topic)
    const [topic, setTopic] = useState(initialTopic);
    const [genre, setGenre] = useState('');
    const [duration, setDuration] = useState('');

    // v2.5 Narrative Architect (Replaces Advanced v3.0)
    const [structure, setStructure] = useState('viral_hook');
    const [hookStrategy, setHookStrategy] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(true); // Default open for importance

    // URL Grounding (v4.0)
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [refData, setRefData] = useState<ReferenceData | null>(null);

    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    // Presets (v5.0)
    const { presets, savePreset, deletePreset } = usePresets<StoryboardState>('storyboard-presets');
    const [showPresets, setShowPresets] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    const handleSavePreset = () => {
        if (!newPresetName) return;
        savePreset(newPresetName, { genre, duration, structure, hookStrategy });
        setNewPresetName('');
        setShowPresets(false);
    };

    const handleLoadPreset = (data: StoryboardState) => {
        setGenre(data.genre);
        setDuration(data.duration);
        setStructure(data.structure || 'viral_hook');
        setHookStrategy(data.hookStrategy || '');
        setShowPresets(false);
    };

    // Analyze URL Function
    const handleAnalyzeUrl = async () => {
        if (!url) return;
        setIsAnalyzing(true);

        try {
            const isLocalhost = window.location.hostname === 'localhost';
            let data;
            if (isLocalhost && !import.meta.env.VITE_VERCEL_ENV) {
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
            structure,
            hookStrategy,
            refData,
            'ko'
        );
        setResult(prompt);
        if (onScriptGenerate) onScriptGenerate(prompt);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>
                    {platform === 'gemini' ? 'Gemini' : 'ChatGPT'} 영상 콘티 작가 모드
                </h3>

                {/* Preset Toggle */}
                <button
                    onClick={() => setShowPresets(!showPresets)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px', background: '#333', border: '1px solid #555', color: 'white', cursor: 'pointer' }}
                >
                    <FolderOpen size={16} /> 프리셋 ({presets.length})
                </button>
            </div>

            {/* Preset Modal/Dropdown */}
            {showPresets && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#222', borderRadius: '8px', border: '1px solid #444' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#ccc' }}>설정 불러오기 / 저장</h4>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {presets.length === 0 && <span style={{ color: '#666' }}>저장된 프리셋이 없습니다.</span>}
                        {presets.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#333', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                                <span onClick={() => handleLoadPreset(p.data)} style={{ cursor: 'pointer', fontWeight: 600 }}>{p.name}</span>
                                <Trash2 size={14} style={{ cursor: 'pointer', color: '#ff6b6b' }} onClick={() => deletePreset(p.id)} />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #444', paddingTop: '1rem' }}>
                        <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="새 프리셋 이름 (예: 쇼츠 기본)"
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: '#111', color: 'white', border: '1px solid #555' }}
                        />
                        <button onClick={handleSavePreset} disabled={!newPresetName} style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: 'black', fontWeight: 600, borderRadius: '4px' }}>
                            <Save size={16} /> 저장
                        </button>
                    </div>
                </div>
            )}

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

                {/* v2.5 Narrative Architect Controls */}
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
                            color: 'var(--color-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontWeight: 600 }}>📐 구성 및 훅 설계 (Narrative Architecture)</span>
                        {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showAdvanced && (
                        <div style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>영상 구성 프레임워크 (Structure Framework)</label>
                                <select
                                    value={structure}
                                    onChange={(e) => setStructure(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                                >
                                    <option value="viral_hook">Viral Hook (조회수/Retention 중심)</option>
                                    <option value="storytelling">Storytelling Arc (몰입/공감 중심)</option>
                                    <option value="educational">Problem-Solution (정보/설득 중심)</option>
                                </select>
                                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.4rem' }}>
                                    * <strong>Viral Hook</strong>: 3초 안에 승부를 보는 숏폼/트렌드 영상에 적합<br />
                                    * <strong>Storytelling</strong>: 브이로그, 드라마틱한 전개<br />
                                    * <strong>Problem-Solution</strong>: 리뷰, 꿀팁, 강의 영상
                                </p>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>오프닝 훅 전략 (Opening Hook Strategy)</label>
                                <select
                                    value={hookStrategy}
                                    onChange={(e) => setHookStrategy(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                                >
                                    <option value="">선택 안 함 (기본)</option>
                                    <option value="Negative Hook">Negative Hook ("이것 모르면 손해")</option>
                                    <option value="Visual Spectacle">Visual Spectacle (압도적 영상미 시작)</option>
                                    <option value="Curiosity Gap">Curiosity Gap (결과 먼저 보여주기)</option>
                                    <option value="Relatable Pain">Relatable Pain ("이런 적 있으시죠?")</option>
                                </select>
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
                            value={result}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                setResult(newVal);
                                if (onScriptGenerate) onScriptGenerate(newVal);
                            }}
                            placeholder="AI가 생성한 프롬프트/스크립트가 여기에 표시됩니다. 자유롭게 수정하세요."
                            style={{
                                width: '100%',
                                height: '300px',
                                padding: '1rem',
                                borderRadius: '8px',
                                background: 'rgba(0,0,0,0.3)',
                                color: '#e0e0e0',
                                fontFamily: 'monospace',
                                lineHeight: '1.5',
                                border: '1px solid rgba(255,255,255,0.1)'
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
