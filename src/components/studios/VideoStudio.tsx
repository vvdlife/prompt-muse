import React, { useState } from 'react';
import { generateVeoExpertPrompt, type ReferenceData } from '../../generators';
import { Copy, Check, Info, ChevronDown, ChevronUp, Link as LinkIcon, Loader2, Clapperboard, Download, Upload } from 'lucide-react';
import { useSettingsFile } from '../../hooks/useSettingsFile';
import '../../App.css';

interface VideoStudioProps {
    initialContext?: string;
}

interface VideoStudioState {
    description: string;
    model: string;
    camera: string;
    resolution: '1080p' | '4k';
    useAudio: boolean;
    lighting: string;
    lens: string;
    customInstruction: string;
    url: string;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ initialContext = '' }) => {
    // Local State
    const [description, setDescription] = useState(initialContext);
    const [model, setModel] = useState('Veo 3 (Cinematic) - Latest');

    // Veo3 Specific
    const [camera, setCamera] = useState('Establishing Shot');
    const [resolution, setResolution] = useState<'1080p' | '4k'>('4k');
    const [useAudio, setUseAudio] = useState(true);

    // Advanced
    const [lighting, setLighting] = useState('');
    const [lens, setLens] = useState('');
    const [customInstruction, setCustomInstruction] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // URL Grounding
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [refData, setRefData] = useState<ReferenceData | null>(null);

    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    // File Presets (v4.1)
    const { exportSettings, importSettings } = useSettingsFile<VideoStudioState>({
        description, model, camera, resolution, useAudio, lighting, lens, customInstruction, url
    }, (data) => {
        if (data.description) setDescription(data.description);
        if (data.model) setModel(data.model);
        if (data.camera) setCamera(data.camera);
        if (data.resolution) setResolution(data.resolution);
        if (data.useAudio !== undefined) setUseAudio(data.useAudio);
        if (data.lighting) setLighting(data.lighting);
        if (data.lens) setLens(data.lens);
        if (data.customInstruction) setCustomInstruction(data.customInstruction);
        if (data.url) setUrl(data.url);
    });

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
                        title: "Example Cinematic Reference",
                        description: "Mood board for cyberpunk aesthetic.",
                        keywords: "neon, rain, dark city, futuristic"
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
        const prompt = generateVeoExpertPrompt(
            description,
            model,
            camera, resolution, useAudio, lighting, lens, '', customInstruction, refData
        );
        setResult(prompt);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fade-in">
            {/* Header / Model Selection */}
            <div className="panel-sub mb-sm">
                <div className="flex-between mb-sm">
                    <div className="flex-row text-secondary font-bold">
                        <Clapperboard size={20} /> Video Studio
                    </div>
                    {/* Preset Controls */}
                    <div className="flex-row gap-xs">
                        <button title="설정 파일로 저장" className="btn-icon" onClick={() => exportSettings('video_studio_config')}>
                            <Download size={16} />
                        </button>
                        <label className="btn-icon" title="설정 파일 불러오기" style={{ cursor: 'pointer' }}>
                            <Upload size={16} />
                            <input type="file" accept=".json" onChange={importSettings} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>
                <div>
                    <label className="label-text">사용 모델 (Target Model)</label>
                    <select
                        className="select-primary"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    >
                        <option value="Veo 3 (Cinematic) - Latest">Veo 3 (Cinematic) - 2025 Latest</option>
                        <option value="Veo 2 (Standard)">Veo 2 (Standard) - Fast</option>
                        <option value="Veo (Legacy)">Veo (Legacy)</option>
                    </select>
                </div>
            </div>

            {/* Inputs */}
            <div className="flex-col gap-md">
                <div>
                    <label className="label-text">
                        촬영 내용 (Shot Description)
                        <span className="text-sm text-secondary ms-2">* 한글 입력 시 자동 보정됨</span>
                    </label>
                    <textarea
                        className="textarea-primary"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="예: 비 젖은 사이버펑크 도시의 네온 사인 아래 서 있는 로봇"
                    />
                </div>

                {/* Additional Instructions */}
                <div>
                    <label className="label-text">
                        추가 요청 사항 (Optional Instructions)
                    </label>
                    <textarea
                        className="textarea-primary"
                        value={customInstruction}
                        onChange={(e) => setCustomInstruction(e.target.value)}
                        placeholder="예: '슬로우 모션' 느낌을 강조해줘."
                        style={{ minHeight: '80px', fontSize: '0.9rem' }}
                    />
                </div>

                {/* URL Reference */}
                <div>
                    <label className="label-text">레퍼런스 이미지 URL (Style Guide)</label>
                    <div className="flex-row gap-xs">
                        <input
                            className="input-primary flex-1"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="예: https://..."
                        />
                        <button
                            onClick={handleAnalyzeUrl}
                            disabled={isAnalyzing || !url}
                            className="btn-secondary"
                            style={{ width: 'auto', padding: '0 1.5rem', opacity: url ? 1 : 0.5, cursor: url ? 'pointer' : 'not-allowed' }}
                        >
                            {isAnalyzing ? <Loader2 size={18} className="spin" /> : <LinkIcon size={18} />}
                            {isAnalyzing ? '분석' : '분석'}
                        </button>
                    </div>
                    {refData && (
                        <div className="panel-inner mt-xs border border-primary text-sm flex-row text-muted" style={{ borderColor: 'var(--color-primary)' }}>
                            <div className="font-bold text-primary">✅ 분석 완료: {refData.title}</div>
                        </div>
                    )}
                </div>

                {/* Core Controls */}
                <div className="panel-inner">
                    <h4 className="text-secondary flex-row mb-sm">
                        <Info size={16} /> 필수 설정 (Camera & Res)
                    </h4>
                    <div className="grid-cols-2">
                        <div>
                            <label className="label-text">컷의 용도 (Shot Function)</label>
                            <select className="select-primary" value={camera} onChange={(e) => setCamera(e.target.value)}>
                                <option value="Establishing Shot">전경/배경 (Establishing Shot)</option>
                                <option value="Detail Texture">감성/디테일 (Detail Texture)</option>
                                <option value="Reaction/Emotion">인물 리액션 (Reaction/Emotion)</option>
                                <option value="Action/Transition">빠른 전환/액션 (Action/Transition)</option>
                                <option value="Slow Motion">슬로우 모션 (Slow Motion)</option>
                                <option value="Hyperlapse">하이퍼랩스 (Hyperlapse)</option>
                                <option value="Drone Shot">드론 촬영 (Drone View)</option>
                                <option value="Handheld">핸드헬드 (Handheld/Shake)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-text">해상도 및 오디오</label>
                            <div className="flex-row">
                                <label className="flex-row cursor-pointer select-none">
                                    <input type="checkbox" checked={useAudio} onChange={(e) => setUseAudio(e.target.checked)} />
                                    오디오
                                </label>
                                <select className="select-primary" value={resolution} onChange={(e) => setResolution(e.target.value as any)}>
                                    <option value="1080p">1080p</option>
                                    <option value="4k">4K (Pro)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Details */}
                <div className="panel-sub p-0 overflow-hidden">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex-between w-full p-4 text-muted hover:bg-white/5 transition-colors"
                        style={{ background: 'transparent', border: 'none' }}
                    >
                        <span className="font-bold">🎨 디테일 룩/조명 설정 (Details)</span>
                        {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {showAdvanced && (
                        <div className="bg-black/20 p-6 grid-cols-2">
                            <div>
                                <label className="label-text">조명 (Lighting)</label>
                                <select className="select-primary" value={lighting} onChange={(e) => setLighting(e.target.value)}>
                                    <option value="">기본 (Default)</option>
                                    <option value="Golden Hour">Golden Hour (황금 시간대)</option>
                                    <option value="Cyberpunk Neon">Cyberpunk Neon (네온)</option>
                                    <option value="Studio Softbox">Studio Softbox (부드러운 조명)</option>
                                    <option value="Cinematic Lighting">Cinematic (영화적 조명)</option>
                                    <option value="Natural Sunlight">Natural Sunlight (자연광)</option>
                                    <option value="Dark Noir">Dark Noir (느와르/어두움)</option>
                                    <option value="Volumetric Fog">Volumetric Fog (안개 효과)</option>
                                    <option value="Hard Shadows">Hard Shadows (강한 그림자)</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-text">렌즈/화각 (Lens)</label>
                                <select className="select-primary" value={lens} onChange={(e) => setLens(e.target.value)}>
                                    <option value="">기본 (Default)</option>
                                    <option value="Wide Angle">Wide Angle (광각/웅장함)</option>
                                    <option value="Telephoto">Telephoto (망원/인물집중)</option>
                                    <option value="Macro">Macro (접사/디테일)</option>
                                    <option value="Fisheye">Fisheye (어안 렌즈)</option>
                                    <option value="35mm Film">35mm Film (필름 감성)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    className="btn-secondary text-lg mt-sm"
                >
                    Veo3 Video 프롬프트 생성
                </button>

                {result && (
                    <div className="mt-lg fade-in">
                        <div className="flex-between mb-sm text-muted">
                            <span>생성된 전문가 프롬프트 ({model})</span>
                            <button onClick={handleCopy} className="btn-icon" style={{ color: copied ? 'var(--color-secondary)' : 'white' }}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? '복사됨!' : '복사하기'}
                            </button>
                        </div>
                        <div className="result-box" style={{ borderLeftColor: 'var(--color-secondary)' }}>
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
