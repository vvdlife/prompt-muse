import React, { useState, useEffect } from 'react';
import { generateStoryboardPrompt, type ReferenceData } from '../../generators';
import { Copy, Check, ChevronDown, ChevronUp, Link as LinkIcon, Loader2, Save, Trash2, FolderOpen, Bot, Zap, Download, Upload } from 'lucide-react';
import { usePresets } from '../../hooks/usePresets';
import { useSettingsFile } from '../../hooks/useSettingsFile';

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
    // v4.1 Enhanced State
    customInstruction: string;
    url: string;
    topic: string; // Also save topic
}

export const StoryboardMode: React.FC<StoryboardModeProps> = ({ platform, initialTopic = '', onScriptGenerate }) => {
    // Core (Initialize with Global Topic)
    const [topic, setTopic] = useState(initialTopic);
    const [genre, setGenre] = useState('');
    const [duration, setDuration] = useState('');

    // v2.6 Platform & Model Selection
    const [localPlatform, setLocalPlatform] = useState<'chatgpt' | 'gemini'>(platform);
    const [localModel, setLocalModel] = useState('');

    // Update local platform if prop changes (optional sync)
    useEffect(() => { setLocalPlatform(platform); }, [platform]);

    // Set default model when platform changes
    useEffect(() => {
        if (localPlatform === 'gemini') {
            setLocalModel('Gemini 3.0 Ultra (2025 Latest)');
        } else {
            setLocalModel('GPT-5.2 (Latest)');
        }
    }, [localPlatform]);

    // v2.5 Narrative Architect (Replaces Advanced v3.0)
    const [structure, setStructure] = useState('viral_hook');
    const [hookStrategy, setHookStrategy] = useState('');
    const [customInstruction, setCustomInstruction] = useState(''); // v2.7 User Override
    const [showAdvanced, setShowAdvanced] = useState(true); // Default open for importance

    // URL Grounding (v4.0)
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [refData, setRefData] = useState<ReferenceData | null>(null);

    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    // Presets (v5.0 local / v4.1 file)
    const { presets, savePreset, deletePreset } = usePresets<StoryboardState>('storyboard-presets');
    const [showPresets, setShowPresets] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    // v4.1 File-based Presets
    const { exportSettings, importSettings } = useSettingsFile<StoryboardState>({
        genre, duration, structure, hookStrategy, customInstruction, url, topic
    }, (data) => {
        setGenre(data.genre);
        setDuration(data.duration);
        setStructure(data.structure || 'viral_hook');
        setHookStrategy(data.hookStrategy || '');
        setCustomInstruction(data.customInstruction || '');
        setUrl(data.url || '');
        if (data.topic) setTopic(data.topic);
    });

    const handleSavePreset = () => {
        if (!newPresetName) return;
        savePreset(newPresetName, { genre, duration, structure, hookStrategy, customInstruction, url, topic });
        setNewPresetName('');
        setShowPresets(false);
    };

    const handleLoadPreset = (data: StoryboardState) => {
        setGenre(data.genre);
        setDuration(data.duration);
        setStructure(data.structure || 'viral_hook');
        setHookStrategy(data.hookStrategy || '');
        setCustomInstruction(data.customInstruction || '');
        setUrl(data.url || '');
        // Optional: Load topic if desired, or keep current
        if (data.topic) setTopic(data.topic);
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
            localPlatform,
            localModel,
            topic,
            genre,
            duration,
            structure,
            hookStrategy,
            customInstruction,
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
                <h3 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bot /> 대본 연구소 (Script Lab)
                </h3>

                {/* Preset Controls */}
                <div className="flex-row gap-xs">
                    {/* File Preset */}
                    <button title="설정 파일로 저장" className="btn-icon" onClick={() => exportSettings('storyboard_config')}>
                        <Download size={16} />
                    </button>
                    <label className="btn-icon" title="설정 파일 불러오기" style={{ cursor: 'pointer' }}>
                        <Upload size={16} />
                        <input type="file" accept=".json" onChange={importSettings} style={{ display: 'none' }} />
                    </label>

                    {/* Local Preset Toggle */}
                    <button
                        onClick={() => setShowPresets(!showPresets)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px', background: '#333', border: '1px solid #555', color: 'white', cursor: 'pointer' }}
                    >
                        <FolderOpen size={16} /> 로컬 프리셋 ({presets.length})
                    </button>
                </div>
            </div>

            {/* Platform Selection Bar */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <button
                        onClick={() => setLocalPlatform('gemini')}
                        style={{
                            padding: '1rem', borderRadius: '8px',
                            background: localPlatform === 'gemini' ? 'rgba(77, 171, 247, 0.2)' : 'transparent',
                            border: localPlatform === 'gemini' ? '1px solid #4dabf7' : '1px solid #444',
                            color: localPlatform === 'gemini' ? '#4dabf7' : '#888',
                            fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <Zap size={18} /> Gemini
                    </button>
                    <button
                        onClick={() => setLocalPlatform('chatgpt')}
                        style={{
                            padding: '1rem', borderRadius: '8px',
                            background: localPlatform === 'chatgpt' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            border: localPlatform === 'chatgpt' ? '1px solid white' : '1px solid #444',
                            color: localPlatform === 'chatgpt' ? 'white' : '#888',
                            fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        <Bot size={18} /> ChatGPT
                    </button>
                </div>

                {/* Model Selection */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>사용 모델 (Target Model)</label>
                    <select
                        value={localModel}
                        onChange={(e) => setLocalModel(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                    >
                        {localPlatform === 'gemini' ? (
                            <>
                                <option value="Gemini 3.0 Ultra (2025 Latest)">Gemini 3.0 Ultra (2025 Latest) - Best for Scripting</option>
                                <option value="Gemini 3.0 Pro">Gemini 3.0 Pro - Balanced</option>
                                <option value="Gemini 3.0 Flash (Fastest)">Gemini 3.0 Flash - Fastest</option>
                                <option value="Gemini 2.0 Flash (Legacy)">Gemini 2.0 Flash (Legacy)</option>
                            </>
                        ) : (
                            <>
                                <option value="GPT-5.2 (Latest)">GPT-5.2 (Latest) - Superior Creative Writing</option>
                                <option value="GPT-5.1">GPT-5.1 - Stable</option>
                                <option value="o2 (Deep Reasoning)">o2 (Deep Reasoning) - Best for Logic/Structure</option>
                                <option value="GPT-5 (Standard)">GPT-5 (Standard)</option>
                                <option value="GPT-4o (Legacy)">GPT-4o (Legacy)</option>
                            </>
                        )}
                    </select>
                </div>
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
                                    <option value="storytelling">Hero's Journey (영웅의 여정)</option>
                                    <option value="problem_solution">Problem-Solution (정보/설득 중심)</option>
                                    <option value="listicle">Listicle (Top N 랭킹/리스트)</option>
                                    <option value="day_in_life">Day in the Life (브이로그/일상)</option>
                                    <option value="behind_scenes">Behind the Scenes (제작 과정/비하인드)</option>
                                    <option value="educational">Educational/How-to (강의/튜토리얼)</option>
                                    <option value="review_unboxing">Review & Unboxing (리뷰/언박싱)</option>
                                </select>
                                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.4rem' }}>
                                    * <strong>Viral Hook</strong>: 3초 안에 승부를 보는 숏폼/트렌드 영상<br />
                                    * <strong>Hero's Journey</strong>: 몰입감 높은 스토리텔링<br />
                                    * <strong>Listicle</strong>: 정보 전달 효율 극대화<br />
                                    * <strong>Problem-Solution</strong>: 명확한 솔루션 제시
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
                                    <option value="Visual Loop">Visual Loop (무한 반복되는 시각적 만족감)</option>
                                    <option value="Shocking Fact">Shocking Fact (충격적인 통계/사실)</option>
                                    <option value="Story Start">Story Start ("제가 ~했을 때 일입니다")</option>
                                    <option value="Direct Challenge">Direct Challenge ("~할 수 있으세요?")</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* v2.7 Custom User Instruction */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
                        추가 요청 사항 (Producer Direction)
                        <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem' }}>* AI의 기획보다 우선 반영됩니다.</span>
                    </label>
                    <textarea
                        value={customInstruction}
                        onChange={(e) => setCustomInstruction(e.target.value)}
                        placeholder="예: 전체적으로 진지한 톤으로 작성해줘. 마지막에 쿠키 영상 아이디어도 포함해줘."
                        style={{ width: '100%', minHeight: '80px', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid #444', resize: 'vertical', fontSize: '0.9rem' }}
                    />
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
                    {localPlatform === 'gemini' ? 'Gemini' : 'ChatGPT'} 콘티 프롬프트 생성 ({localModel})
                </button>

                {result && (
                    <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#aaa' }}>
                            <span>생성된 전문가 프롬프트 ({localModel})</span>
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


