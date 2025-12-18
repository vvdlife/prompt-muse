import React, { useState } from 'react';
import { generateMidjourneyExpertPrompt, type ReferenceData } from '../../generators';
import { useSettingsFile } from '../../hooks/useSettingsFile';
import { Copy, Check, Info, ChevronDown, ChevronUp, Link as LinkIcon, Loader2, Palette, Download, Upload, User, Image as ImageIcon } from 'lucide-react';
import '../../App.css';

interface ArtStudioProps {
    initialContext?: string;
}

interface ArtSettings {
    description: string;
    model: string;
    ar: string;
    stylize: number;
    weird: number;
    lighting: string;
    lens: string;
    color: string;
    texture: string;
    customInstruction: string;
    refData: ReferenceData | null;
    cref: string;
    cw: number;
    sref: string;
    sw: number;
}

export const ArtStudio: React.FC<ArtStudioProps> = ({ initialContext = '' }) => {
    // Local State
    const [description, setDescription] = useState(initialContext);
    const [model, setModel] = useState('v7.2 (Photorealism) - Latest');

    // Midjourney Specific
    const [ar, setAr] = useState('16:9');
    const [stylize, setStylize] = useState(250);
    const [weird, setWeird] = useState(0);

    // Advanced
    const [lighting, setLighting] = useState('');
    const [lens, setLens] = useState('');
    const [color, setColor] = useState('');
    const [texture, setTexture] = useState('');
    const [customInstruction, setCustomInstruction] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // URL Grounding
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [refData, setRefData] = useState<ReferenceData | null>(null);

    // v4.0 Professional Consistency
    const [cref, setCref] = useState('');
    const [cw, setCw] = useState(100);
    const [sref, setSref] = useState('');
    const [sw, setSw] = useState(1000);

    // v4.1 Preset System
    const { exportSettings, importSettings } = useSettingsFile<ArtSettings>({
        description, model, ar, stylize, weird, lighting, lens, color, texture, customInstruction, refData, cref, cw, sref, sw
    }, (data) => {
        setDescription(data.description);
        setModel(data.model);
        setAr(data.ar);
        setStylize(data.stylize);
        setWeird(data.weird);
        setLighting(data.lighting);
        setLens(data.lens);
        setColor(data.color);
        setTexture(data.texture);
        setCustomInstruction(data.customInstruction);
        if (data.refData) setRefData(data.refData);
        setCref(data.cref || '');
        setCw(data.cw || 100);
        setSref(data.sref || '');
        setSw(data.sw || 1000);
    });

    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

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
                        title: "Example ArtStation Reference",
                        description: "Fantasy oil painting style guide.",
                        keywords: "oil, brush strokes, fantasy, warm lighting"
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
        const prompt = generateMidjourneyExpertPrompt(
            description,
            model,
            ar, stylize, weird, lighting, lens, color, texture, customInstruction, refData,
            cref, cw, sref, sw
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
                    <div className="flex-row text-accent font-bold">
                        <Palette size={20} /> Art Studio (Midjourney)
                    </div>
                    {/* Preset Buttons */}
                    <div className="flex-row gap-xs">
                        <button
                            onClick={() => exportSettings('art_studio')}
                            className="btn-icon"
                            title="설정 파일로 저장"
                        >
                            <Download size={18} /> 저장
                        </button>
                        <label className="btn-icon" title="설정 파일 불러오기" style={{ cursor: 'pointer' }}>
                            <Upload size={18} /> 불러오기
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
                        <option value="v7.2 (Photorealism) - Latest">Midjourney v7.2 (Photorealism) - 2025 Latest</option>
                        <option value="v7.0 (Base)">Midjourney v7.0 (Base)</option>
                        <option value="Niji 7 (Anime)">Niji 7 (Anime)</option>
                        <option value="v6.1">Midjourney v6.1 (Legacy)</option>
                    </select>
                </div>
            </div>

            {/* Inputs */}
            <div className="flex-col gap-md">
                <div>
                    <label className="label-text">
                        이미지 묘사 (Art Description)
                        <span className="text-sm text-accent ms-2">* 한글 입력 시 자동 보정됨</span>
                    </label>
                    <textarea
                        className="textarea-primary"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="예: 비 젖은 사이버펑크 도시의 네온 사인 아래 서 있는 로봇"
                    />
                </div>

                {/* Professional Consistency Controls */}
                <div className="panel-inner border border-accent/30">
                    <h4 className="text-secondary flex-row mb-sm font-bold">
                        🧩 캐릭터 및 스타일 일관성 (Consistency)
                    </h4>
                    <div className="grid-cols-2 gap-md">
                        {/* Character Ref */}
                        <div>
                            <label className="label-text flex-row gap-xs">
                                <User size={14} /> 캐릭터 참조 (--cref)
                            </label>
                            <input
                                className="input-primary mb-xs"
                                type="text"
                                value={cref}
                                onChange={(e) => setCref(e.target.value)}
                                placeholder="이미지 URL (https://...)"
                            />
                            <div className="flex-between text-xs text-muted">
                                <span>가중치 (--cw): {cw}</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={cw}
                                onChange={(e) => setCw(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Style Ref */}
                        <div>
                            <label className="label-text flex-row gap-xs">
                                <ImageIcon size={14} /> 스타일 참조 (--sref)
                            </label>
                            <input
                                className="input-primary mb-xs"
                                type="text"
                                value={sref}
                                onChange={(e) => setSref(e.target.value)}
                                placeholder="이미지 URL (https://...)"
                            />
                            <div className="flex-between text-xs text-muted">
                                <span>가중치 (--sw): {sw}</span>
                            </div>
                            <input
                                type="range" min="0" max="1000"
                                value={sw}
                                onChange={(e) => setSw(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
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
                        placeholder="예: '수채화' 느낌을 넣어줘."
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
                    <h4 className="text-accent flex-row mb-sm">
                        <Info size={16} /> 필수 설정 (Basic Params)
                    </h4>
                    <div className="flex-col gap-md">
                        <div>
                            <label className="label-text">종횡비 (--ar)</label>
                            <div className="flex-row flex-wrap gap-xs">
                                {['16:9', '9:16', '1:1', '4:3', '21:9'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setAr(r)}
                                        className="btn-icon"
                                        style={{
                                            borderRadius: '20px',
                                            border: ar === r ? '1px solid var(--color-accent)' : '1px solid #444',
                                            color: ar === r ? 'var(--color-accent)' : '#aaa',
                                            background: ar === r ? 'rgba(255, 0, 255, 0.1)' : 'transparent'
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid-cols-2">
                            <div>
                                <label className="flex-between mb-xs text-sm">
                                    스타일 강도 ({stylize})
                                </label>
                                <input type="range" min="0" max="1000" value={stylize} onChange={(e) => setStylize(Number(e.target.value))} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label className="flex-between mb-xs text-sm">
                                    기괴함 ({weird})
                                </label>
                                <input type="range" min="0" max="3000" value={weird} onChange={(e) => setWeird(Number(e.target.value))} style={{ width: '100%' }} />
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
                            <div>
                                <label className="label-text">색감 (Color Palette)</label>
                                <select className="select-primary" value={color} onChange={(e) => setColor(e.target.value)}>
                                    <option value="">기본 (Default)</option>
                                    <option value="Vibrant High Saturation">Vibrant (강렬함)</option>
                                    <option value="Pastel Tones">Pastel (파스텔톤)</option>
                                    <option value="Black and White">Black & White (흑백)</option>
                                    <option value="Sepia Vintage">Sepia (빈티지)</option>
                                    <option value="Cool Blue">Cool Blue (차가움)</option>
                                    <option value="Warm Orange">Warm Orange (따뜻함)</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-text">텍스처/스타일 (Texture)</label>
                                <select className="select-primary" value={texture} onChange={(e) => setTexture(e.target.value)}>
                                    <option value="">기본 (Realism)</option>
                                    <option value="Oil Painting">Oil Painting (유화)</option>
                                    <option value="Watercolor">Watercolor (수채화)</option>
                                    <option value="3D Render Pixar Style">3D Render (픽사풍)</option>
                                    <option value="Ukiyoe">Ukiyoe (일본 판화)</option>
                                    <option value="Cyberpunk Digital">Cyberpunk Digital (디지털 아트)</option>
                                    <option value="Pencil Sketch">Pencil Sketch (연필 스케치)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    className="btn-accent text-lg mt-sm"
                >
                    Midjourney Image 프롬프트 생성
                </button>

                {result && (
                    <div className="mt-lg fade-in">
                        <div className="flex-between mb-sm text-muted">
                            <span>생성된 전문가 프롬프트 ({model})</span>
                            <button onClick={handleCopy} className="btn-icon" style={{ color: copied ? 'var(--color-accent)' : 'white' }}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? '복사됨!' : '복사하기'}
                            </button>
                        </div>
                        <div className="result-box" style={{ borderLeftColor: 'var(--color-accent)' }}>
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
