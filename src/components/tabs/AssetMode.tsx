import React, { useState } from 'react';
import { generateMidjourneyExpertPrompt, generateVeoExpertPrompt, generateGeminiThumbnailPrompt, type ReferenceData } from '../../generators';
import { YoutubeExtractor } from '../YoutubeExtractor';
import { Copy, Check, Info, ChevronDown, ChevronUp, Link as LinkIcon, Loader2, Image as ImageIcon, LayoutTemplate } from 'lucide-react';

interface AssetModeProps {
    platform: 'midjourney' | 'veo3';
    // Optional: Force a specific asset type (e.g. 'thumbnail') regardless of internal toggle
    fixedAssetType?: 'default' | 'thumbnail';
    // v2.6 Pipeline integration
    initialContext?: string; // For Veo3 (Script context)
    initialTopic?: string;   // For Thumbnail (Topic context)
}

export const AssetMode: React.FC<AssetModeProps> = ({ platform, fixedAssetType, initialContext = '', initialTopic = '' }) => {
    // v13.0: If fixedAssetType is provided, force that mode. Else default.
    const [assetType, setAssetType] = useState<'default' | 'thumbnail'>(fixedAssetType || 'default');
    const [description, setDescription] = useState(initialContext || initialTopic || '');

    // Thumbnail Mode State (v6.0)
    // v2.2 Simplified: Removed Emotion/Composition/TextSpace states as they are now defaults.

    const [thumbEngine, setThumbEngine] = useState<'midjourney' | 'gemini'>('gemini'); // Default to Gemini (Fixed)
    const [thumbImageFile, setThumbImageFile] = useState<File | null>(null);
    const [thumbImagePreview, setThumbImagePreview] = useState<string | null>(null);
    const [thumbCustomInstruction, setThumbCustomInstruction] = useState(''); // v2.1 Custom Instruction

    // Midjourney States
    const [ar, setAr] = useState('16:9');
    const [stylize, setStylize] = useState(250);
    const [weird, setWeird] = useState(0);

    // Veo3 States
    const [camera, setCamera] = useState('Establishing Shot'); // v2.5: Stores 'Shot Function' now
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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = () => {
        let prompt = '';
        if (platform === 'midjourney') {
            if (assetType === 'thumbnail') {
                // v2.2 Simplified: Always use Gemini logic with defaults
                prompt = generateGeminiThumbnailPrompt(
                    description,
                    'excited',      // Default Emotion
                    'dynamic',      // Default Composition
                    true,           // Default Text Space
                    !!thumbImageFile,
                    thumbCustomInstruction
                );
            } else {
                // v2.5 Channel Consultant: 'lens' state now holds 'channelPreset'
                prompt = generateMidjourneyExpertPrompt(description, ar, stylize, weird, lighting, lens, color, texture, thumbCustomInstruction, refData);
            }
        } else {
            // v2.5 B-Roll Director: 'camera' state now holds 'shotFunction'
            prompt = generateVeoExpertPrompt(description, camera, resolution, useAudio, lighting, lens, thumbCustomInstruction, refData);
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
                {fixedAssetType === 'thumbnail' ? 'Viral Thumbnail Studio' : (platform === 'midjourney' ? 'Midjourney Art Studio' : 'Veo3 Video Studio')}
            </h3>

            {/* v6.0 Thumbnail Studio Mode Toggle - HIDDEN if fixedAssetType is present (v13.0) */}
            {platform === 'midjourney' && !fixedAssetType && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#222', padding: '0.5rem', borderRadius: '8px' }}>
                    <button
                        onClick={() => setAssetType('default')}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '6px',
                            background: assetType === 'default' ? 'var(--color-primary)' : 'transparent',
                            color: assetType === 'default' ? 'black' : '#888',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ImageIcon size={18} /> 일반 에셋
                    </button>
                    <button
                        onClick={() => setAssetType('thumbnail')}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '6px',
                            background: assetType === 'thumbnail' ? 'var(--color-accent)' : 'transparent',
                            color: assetType === 'thumbnail' ? 'white' : '#888',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <LayoutTemplate size={18} /> 썸네일 스튜디오
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
                        {assetType === 'thumbnail' ? '영상 주제 (Thumbnail Topic)' : '장면 묘사 (Visual Description)'}
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', marginLeft: '0.5rem' }}>* 한글 입력 시 자동 보정됨</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={assetType === 'thumbnail' ? "예: 아이폰 16 vs 갤럭시 S24 비교 리뷰" : "예: 비 젖은 사이버펑크 도시의 네온 사인 아래 서 있는 로봇"}
                        style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)', resize: 'vertical' }}
                    />
                </div>

                {/* Additional Instructions (Optional) - v2.1 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
                        추가 요청 사항 (Optional Instructions)
                        <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem' }}>* Expert PD의 기획보다 우선 반영됩니다.</span>
                    </label>
                    <textarea
                        value={thumbCustomInstruction}
                        onChange={(e) => setThumbCustomInstruction(e.target.value)}
                        placeholder="예: 기본적으로 '역동적/흥분됨' 톤입니다. 차분한 리뷰나 특정 구도를 원하시면 여기에 적어주세요."
                        style={{ width: '100%', minHeight: '80px', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid #444', resize: 'vertical', fontSize: '0.9rem' }}
                    />
                </div>

                {/* Thumbnail Specific Inputs */}
                {assetType === 'thumbnail' && platform === 'midjourney' ? (
                    <div style={{ padding: '1.5rem', background: 'rgba(255, 0, 255, 0.05)', borderRadius: '8px', border: '1px solid var(--color-accent)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ color: 'var(--color-accent)', fontWeight: 'bold', margin: 0 }}>썸네일 전용 설정 (Viral Formula)</h4>

                            {/* Generator Engine Toggle REMOVED */}
                        </div>

                        {/* v14.0 YouTube Thumbnail Extractor Integration */}
                        <YoutubeExtractor
                            onApplyStyle={async (url) => {
                                try {
                                    // v14.1 Gemini Bridge: Fetch URL and convert to File
                                    const response = await fetch(url);
                                    const blob = await response.blob();
                                    const file = new File([blob], "youtube_thumbnail.jpg", { type: "image/jpeg" });

                                    setThumbImageFile(file);
                                    setThumbImagePreview(url);
                                    setThumbEngine('gemini');

                                    alert('스타일이 적용되었습니다! (Gemini 이미지 복제 모드)');
                                } catch (e) {
                                    console.error("Image fetch failed", e);
                                    alert('이미지를 불러오는데 실패했습니다. URL을 확인해주세요.');
                                }
                            }}
                        />

                        {/* Engine Selection: REMOVED by user request (Gemini Only) */}
                        {/* 
                         <div style={{ display: 'flex', ... }}> ... </div>
                        */}

                        {/* v12.0 Hide manual options if Gemini Image Ref is active */}
                        {/* v2.2 Simplified UI: Emotion & Composition Controls REMOVED by user request */}
                        {/* We use 'Custom Instruction' for these details now. */}

                        {thumbEngine === 'gemini' && thumbImagePreview && (
                            <div style={{ padding: '1rem', background: 'rgba(77, 171, 247, 0.1)', borderRadius: '8px', border: '1px solid #4dabf7', marginBottom: '1.5rem', textAlign: 'center', color: '#99e9f2' }}>
                                ✨ <strong>이미지 복제 모드 활성화</strong><br />
                                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>감정, 구도 등 상세 설정은 무시되고, 업로드한 이미지 스타일을 전적으로 따릅니다.</span>
                            </div>
                        )}

                        {/* v2.2 Simplified UI: Text Space Toggle REMOVED (Defaulted to True) */}

                        {/* v2.2 Simplified UI: Style Reference URL REMOVED (Gemini Only) */}
                        {/* {thumbEngine === 'midjourney' && (...)} */}


                        {thumbEngine === 'gemini' && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #444' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>
                                    스타일 참조 이미지 (Upload Reference)
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginLeft: '0.5rem' }}>* 제미나이가 이 스타일을 분석합니다.</span>
                                </label>

                                <div style={{
                                    border: '2px dashed #444',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    background: thumbImagePreview ? `url(${thumbImagePreview}) center/cover` : 'rgba(0,0,0,0.2)',
                                    height: '150px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Actions for the selected image */}
                                    {thumbImagePreview && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            background: 'rgba(0,0,0,0.6)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            zIndex: 10
                                        }}>
                                            <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                이미지 준비됨 (Ready)
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (thumbImagePreview) {
                                                            window.open(thumbImagePreview, '_blank');
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '0.6rem 1.2rem',
                                                        borderRadius: '6px',
                                                        background: 'var(--color-primary)',
                                                        color: '#000',
                                                        border: 'none',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.9rem',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    <ImageIcon size={16} /> 원본 이미지 새 창으로 열기
                                                </button>
                                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
                                                    * 새 창에서 우클릭하여 '이미지 복사' 또는 '저장' 하세요.
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setThumbImagePreview(null);
                                                    setThumbImageFile(null);
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #666',
                                                    color: '#ccc',
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    marginTop: '0.5rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                이미지 제거 (Clear)
                                            </button>
                                        </div>
                                    )}

                                    {!thumbImagePreview && (
                                        <>
                                            <ImageIcon size={32} style={{ color: '#666', marginBottom: '0.5rem' }} />
                                            <span style={{ fontSize: '0.9rem', color: '#888' }}>
                                                Drop image here or Click to upload
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    opacity: 0,
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Existing Asset Controls */
                    <>
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
                                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>컷의 용도 (Shot Function)</label>
                                        <select
                                            value={camera} // We reuse 'camera' state to store the Shot Function (Intent)
                                            onChange={(e) => setCamera(e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                                        >
                                            <option value="Establishing Shot">전경/배경 (Establishing Shot)</option>
                                            <option value="Detail Texture">감성/디테일 (Detail Texture)</option>
                                            <option value="Reaction/Emotion">인물 리액션 (Reaction/Emotion)</option>
                                            <option value="Action/Transition">빠른 전환/액션 (Action/Transition)</option>
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
                    </>
                )}

                <button
                    onClick={handleGenerate}
                    style={{
                        backgroundColor: assetType === 'thumbnail' ? 'var(--color-accent)' : 'var(--color-secondary)',
                        color: assetType === 'thumbnail' ? 'white' : 'black',
                        fontWeight: 'bold',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginTop: '1rem',
                        boxShadow: assetType === 'thumbnail' ? 'var(--glow-accent)' : 'var(--glow-secondary)'
                    }}
                >
                    {platform === 'midjourney' ? (assetType === 'thumbnail' ? '썸네일 프롬프트 생성 (Viral)' : '디테일 프롬프트 생성') : '비디오 프롬프트 생성'}
                </button>

                {result && (
                    <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#aaa' }}>
                            <span>생성된 전문가 프롬프트</span>
                            <button
                                onClick={handleCopy}
                                style={{ display: 'flex', gap: '0.5rem', color: copied ? (assetType === 'thumbnail' ? 'var(--color-accent)' : 'var(--color-primary)') : 'white' }}
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
                                borderLeft: platform === 'midjourney'
                                    ? (assetType === 'thumbnail' ? '4px solid var(--color-accent)' : '4px solid var(--color-primary)')
                                    : '4px solid var(--color-secondary)',
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
        </div >
    );
};
