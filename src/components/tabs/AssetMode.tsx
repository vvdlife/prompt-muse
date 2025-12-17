import React, { useState } from 'react';
import { generateMidjourneyExpertPrompt, generateVeoExpertPrompt, type ReferenceData } from '../../generators';
import { Copy, Check, Info, ChevronDown, ChevronUp, Link as LinkIcon, Loader2 } from 'lucide-react';

interface AssetModeProps {
    platform: 'midjourney' | 'veo3';
}

export const AssetMode: React.FC<AssetModeProps> = ({ platform }) => {
    // Core
    const [description, setDescription] = useState('');

    // Midjourney States
    const [ar, setAr] = useState('16:9');
    const [stylize, setStylize] = useState(250);
    const [weird, setWeird] = useState(0);

    // Veo3 States
    const [camera, setCamera] = useState('Cinematic drone shot');
    const [resolution, setResolution] = useState<'1080p' | '4k'>('4k');
    const [useAudio, setUseAudio] = useState(true);

    // Advanced (v3.0)
    const [lighting, setLighting] = useState('');
    const [lens, setLens] = useState('');
    const [color, setColor] = useState('');
    const [texture, setTexture] = useState('');
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
            const isLocalhost = window.location.hostname === 'localhost';
            let data;
            if (isLocalhost && !import.meta.env.VITE_VERCEL_ENV) {
                await new Promise(r => setTimeout(r, 1500));
                data = {
                    success: true,
                    data: {
                        title: "Example ArtStation Portfolio",
                        description: "Dark fantasy concept art style guide.",
                        keywords: "dark fantasy, oil painting, heavy texture, gothic"
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
        let prompt = '';
        if (platform === 'midjourney') {
            prompt = generateMidjourneyExpertPrompt(description, ar, stylize, weird, lighting, lens, color, texture, refData);
        } else {
            prompt = generateVeoExpertPrompt(description, camera, resolution, useAudio, lighting, lens, refData);
        }
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
                {platform === 'midjourney' ? 'Midjourney 이미지 에셋' : 'Veo3 숏폼 비디오'} 제작
            </h3>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
                        장면 묘사 (Visual Description)
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', marginLeft: '0.5rem' }}>* 한글 입력 시 자동 보정됨</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="예: 비 젖은 사이버펑크 도시의 네온 사인 아래 서 있는 로봇"
                        style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)', resize: 'vertical' }}
                    />
                </div>

                {/* v4.0 URL Reference Input */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>레퍼런스 이미지/스타일 URL (Style Cloning)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="예: https://artstation.com/artwork/... (스타일 참고용)"
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

                {/* Platform Specific Core Controls */}
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={16} /> 필수 설정 ({platform === 'midjourney' ? 'Basic Params' : 'Cam & Res'})
                    </h4>

                    {platform === 'midjourney' ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>종횡비 (--ar)</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {['16:9', '9:16', '1:1', '4:3', '21:9'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setAr(r)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                border: ar === r ? '1px solid var(--color-primary)' : '1px solid #444',
                                                color: ar === r ? 'var(--color-primary)' : '#aaa',
                                                background: ar === r ? 'rgba(0,255,136,0.1)' : 'transparent'
                                            }}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        스타일 강도 ({stylize})
                                    </label>
                                    <input type="range" min="0" max="1000" value={stylize} onChange={(e) => setStylize(Number(e.target.value))} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        기괴함 ({weird})
                                    </label>
                                    <input type="range" min="0" max="3000" value={weird} onChange={(e) => setWeird(Number(e.target.value))} style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Veo3 Core Controls
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>카메라 무브먼트</label>
                                <select
                                    value={camera}
                                    onChange={(e) => setCamera(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                                >
                                    <option value="Cinematic drone shot">Cinematic Drone Shot (드론)</option>
                                    <option value="FPV fast motion">FPV Fast Motion (빠른 속도감)</option>
                                    <option value="Steadycam follow">Steadycam Follow (인물 추적)</option>
                                    <option value="Slow pan right">Slow Pan Right (천천히 패닝)</option>
                                    <option value="Rack focus">Rack Focus (초점 이동)</option>
                                    <option value="Handheld shaking">Handheld Shaking (핸드헬드)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>해상도 및 오디오</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={useAudio} onChange={(e) => setUseAudio(e.target.checked)} />
                                        오디오
                                    </label>
                                    <select value={resolution} onChange={(e) => setResolution(e.target.value as any)} style={{ padding: '0.5rem', borderRadius: '4px', background: '#222', color: 'white', border: '1px solid #444' }}>
                                        <option value="1080p">1080p</option>
                                        <option value="4k">4K (Pro)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* v3.0 Advanced Details Accordion */}
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
                        <span style={{ fontWeight: 600 }}>🎨 디테일 룩/조명 설정 (Details)</span>
                        {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showAdvanced && (
                        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>조명 (Lighting)</label>
                                <select value={lighting} onChange={(e) => setLighting(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}>
                                    <option value="">기본 (Default)</option>
                                    <option value="Golden Hour">Golden Hour (황금 시간대)</option>
                                    <option value="Cyberpunk Neon">Cyberpunk Neon (네온)</option>
                                    <option value="Studio Softbox">Studio Softbox (스튜디오)</option>
                                    <option value="Cinematic Volumetric">Volumetric Fog (빛내림/안개)</option>
                                    <option value="Dark Noir">Dark Noir (누아르)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>렌즈/화각 (Lens)</label>
                                <select value={lens} onChange={(e) => setLens(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}>
                                    <option value="">기본 (Default)</option>
                                    <option value="Wide Angle">Wide Angle (광각/웅장함)</option>
                                    <option value="Telephoto">Telephoto (망원/인물집중)</option>
                                    <option value="Macro Lens">Macro (초접사)</option>
                                    <option value="Fisheye">Fisheye (어안 렌즈)</option>
                                </select>
                            </div>
                            {platform === 'midjourney' && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>색감 (Color Palette)</label>
                                        <select value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}>
                                            <option value="">기본 (Default)</option>
                                            <option value="Vibrant High Saturation">Vibrant (강렬함)</option>
                                            <option value="Black and White">Black & White (흑백)</option>
                                            <option value="Pastel Tones">Pastel (파스텔)</option>
                                            <option value="Muted Earth Tones">Earth Tones (차분함)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>텍스처/스타일 (Texture)</label>
                                        <select value={texture} onChange={(e) => setTexture(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}>
                                            <option value="">기본 (Realism)</option>
                                            <option value="Oil Painting">Oil Painting (유화)</option>
                                            <option value="3D Render Pixar Style">3D Render (픽사풍)</option>
                                            <option value="Pencil Sketch">Sketch (스케치)</option>
                                            <option value="Glitch Art">Glitch Art (글리치)</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    style={{
                        backgroundColor: 'var(--color-secondary)',
                        color: 'black',
                        fontWeight: 'bold',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginTop: '1rem',
                        boxShadow: 'var(--glow-secondary)'
                    }}
                >
                    {platform === 'midjourney' ? '디테일 프롬프트 생성' : '비디오 프롬프트 생성'}
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
                        <div
                            style={{
                                width: '100%',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                background: 'rgba(0,0,0,0.3)',
                                color: '#e0e0e0',
                                fontFamily: 'monospace',
                                lineHeight: '1.6',
                                borderLeft: platform === 'midjourney' ? '4px solid var(--color-primary)' : '4px solid var(--color-secondary)',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {result}
                        </div>
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
