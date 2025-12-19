import React, { useState } from 'react';
import { generateGeminiThumbnailPrompt } from '../../generators';
import { YoutubeExtractor } from '../YoutubeExtractor';
import { Copy, Check, LayoutTemplate, ExternalLink, Image as ImageIcon, Download, Upload, Smartphone, Monitor } from 'lucide-react';
import { useSettingsFile } from '../../hooks/useSettingsFile';
import { EMOTION_OPTIONS, COMPOSITION_OPTIONS } from '../../constants/thumbnailOptions';
import '../../App.css';

interface ThumbnailStudioProps {
    initialTopic?: string;
}

interface ThumbnailSettings {
    description: string;
    thumbEngine: 'midjourney' | 'gemini';
    thumbCustomInstruction: string;
}

export const ThumbnailStudio: React.FC<ThumbnailStudioProps> = ({ initialTopic = '' }) => {
    // Local State (Colocated)
    const [description, setDescription] = useState(initialTopic);
    const [thumbEngine, setThumbEngine] = useState<'midjourney' | 'gemini'>('gemini'); // Default to Gemini

    // v4.2 Customization State
    const [emotion, setEmotion] = useState('Ecstatic Taste Reaction');
    const [composition, setComposition] = useState('Macro Shot of Food Pickup');
    const [textSpace, setTextSpace] = useState(true);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

    const [thumbImageFile, setThumbImageFile] = useState<File | null>(null);
    const [thumbImagePreview, setThumbImagePreview] = useState<string | null>(null);
    const [thumbCustomInstruction, setThumbCustomInstruction] = useState('');

    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    // v4.1 Preset System (New)
    const { exportSettings, importSettings } = useSettingsFile<ThumbnailSettings>({
        description, thumbEngine, thumbCustomInstruction
    }, (data) => {
        if (data.description) setDescription(data.description);
        if (data.thumbEngine) setThumbEngine(data.thumbEngine);
        if (data.thumbCustomInstruction) setThumbCustomInstruction(data.thumbCustomInstruction);
    });

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
        const prompt = generateGeminiThumbnailPrompt(
            description,
            emotion,
            composition,
            textSpace,
            !!thumbImageFile,
            thumbCustomInstruction,
            aspectRatio
        );
        setResult(prompt);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenGemini = () => {
        window.open('https://gemini.google.com/app', '_blank');
    };

    return (
        <div className="fade-in">
            <div className="flex-between mb-sm">
                <h4 className="flex-row text-accent mb-0">
                    <LayoutTemplate size={20} /> 썸네일 스튜디오 (Viral Formula)
                </h4>
                {/* Preset Buttons */}
                <div className="flex-row gap-xs">
                    <button
                        onClick={() => exportSettings('thumbnail_studio_config')}
                        className="btn-icon"
                        title="설정 파일로 저장"
                    >
                        <Download size={18} />
                    </button>
                    <label className="btn-icon" title="설정 파일 불러오기" style={{ cursor: 'pointer' }}>
                        <Upload size={18} />
                        <input type="file" accept=".json" onChange={importSettings} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            {/* Input Section */}
            <div className="panel-sub" style={{ borderColor: 'var(--color-accent)' }}>

                {/* Aspect Ratio Toggle */}
                <div className="mb-md flex-row gap-md p-sm" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', justifyContent: 'center' }}>
                    <button
                        onClick={() => setAspectRatio('16:9')}
                        className={`btn-toggle ${aspectRatio === '16:9' ? 'active' : ''}`}
                        style={{
                            flex: 1,
                            background: aspectRatio === '16:9' ? 'var(--color-accent)' : 'transparent',
                            color: aspectRatio === '16:9' ? 'white' : '#888',
                            border: '1px solid #444',
                            fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <Monitor size={18} /> Long-form (16:9)
                    </button>
                    <button
                        onClick={() => setAspectRatio('9:16')}
                        className={`btn-toggle ${aspectRatio === '9:16' ? 'active' : ''}`}
                        style={{
                            flex: 1,
                            background: aspectRatio === '9:16' ? '#ff4500' : 'transparent', // Orange for Shorts
                            color: aspectRatio === '9:16' ? 'white' : '#888',
                            border: '1px solid #444',
                            fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <Smartphone size={18} /> Shorts (9:16)
                    </button>
                </div>

                {/* Topic Input */}
                <div className="mb-md">
                    <label className="label-text">
                        영상 주제 (Thumbnail Topic)
                    </label>
                    <textarea
                        className="textarea-primary"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="예: 아이폰 16 vs 갤럭시 S24 비교 리뷰"
                        style={{ minHeight: '80px' }}
                    />
                </div>

                {/* v4.2 Customization Controls */}
                <div className="grid-cols-2 mb-md gap-md">
                    <div>
                        <label className="label-text">
                            분위기/감정 (Emotion)
                        </label>
                        <select
                            className="input-primary"
                            value={emotion}
                            onChange={(e) => setEmotion(e.target.value)}
                        >
                            {EMOTION_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label-text">
                            구도/구성 (Composition)
                        </label>
                        <select
                            className="input-primary"
                            value={composition}
                            onChange={(e) => setComposition(e.target.value)}
                        >
                            {COMPOSITION_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-md">
                    <label className="flex-row gap-xs checkbox-label" style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={textSpace}
                            onChange={(e) => setTextSpace(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <span>텍스트 공간 확보 (Negative Space for Text)</span>
                    </label>
                </div>

                {/* Additional Instructions */}
                <div className="mb-md">
                    <label className="label-text">
                        추가 요청 사항 (Optional Instructions)
                    </label>
                    <textarea
                        className="textarea-primary"
                        value={thumbCustomInstruction}
                        onChange={(e) => setThumbCustomInstruction(e.target.value)}
                        placeholder="예: 텍스트가 잘 보이게 배경을 어둡게 처리해줘."
                        style={{ minHeight: '60px', fontSize: '0.9rem' }}
                    />
                </div>

                {/* YouTube Extractor Integration */}
                <YoutubeExtractor
                    aspectRatio={aspectRatio}
                    onApplyStyle={async (url) => {
                        try {
                            const response = await fetch(url); // Fetch allows Cross-Origin if proxy/CORS is handled.
                            // If direct fetch fails due to CORS, we might need a proxy, but assuming current implementation works.
                            const blob = await response.blob();
                            let file = new File([blob], "youtube_thumbnail.jpg", { type: "image/jpeg" });

                            // Shorts Crop Logic
                            if (aspectRatio === '9:16') {
                                const img = new Image();
                                img.src = URL.createObjectURL(blob);
                                await new Promise((resolve) => { img.onload = resolve; });

                                const canvas = document.createElement('canvas');
                                // Target: 9:16. Assume Height governs (cropping width)
                                const h = img.naturalHeight;
                                const w = h * (9 / 16);
                                const x = (img.naturalWidth - w) / 2;

                                canvas.width = w;
                                canvas.height = h;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                    ctx.drawImage(img, x, 0, w, h, 0, 0, w, h);
                                    const croppedBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                                    if (croppedBlob) {
                                        file = new File([croppedBlob], "shorts_crop.jpg", { type: "image/jpeg" });
                                    }
                                }
                            }

                            setThumbImageFile(file);
                            setThumbImagePreview(URL.createObjectURL(file)); // Show the potentially cropped file
                            setThumbEngine('gemini');

                            alert('스타일이 적용되었습니다! (Gemini 이미지 복제 모드)\n' + (aspectRatio === '9:16' ? '(Shorts 비율로 자동 크롭됨)' : ''));

                        } catch (e) {
                            console.error("Image fetch failed", e);
                            alert('이미지를 불러오는데 실패했습니다. URL을 확인해주세요.');
                        }
                    }}
                />

                {/* Image Clone Mode Indicator */}
                {thumbEngine === 'gemini' && thumbImagePreview && (
                    <div className="panel-inner text-center mb-md mt-md" style={{ background: 'rgba(77, 171, 247, 0.1)', borderColor: '#4dabf7', color: '#99e9f2', border: '1px solid' }}>
                        ✨ <strong>이미지 복제 모드 활성화</strong><br />
                        <span className="text-sm" style={{ opacity: 0.8 }}>감정, 구도 등 상세 설정은 무시되고, 업로드한 이미지 스타일을 전적으로 따릅니다.</span>
                    </div>
                )}

                {/* Image Upload Area */}
                <div className="mt-md" style={{ paddingTop: '1rem', borderTop: '1px solid #444' }}>
                    <label className="label-text">
                        스타일 참조 이미지 (Upload Reference)
                        <span className="text-xs text-accent ms-2">* 제미나이가 이 스타일을 분석합니다.</span>
                    </label>

                    <div
                        onClick={() => {
                            if (thumbImagePreview) {
                                window.open(thumbImagePreview, '_blank');
                            }
                        }}
                        style={{
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
                            overflow: 'hidden',
                            cursor: thumbImagePreview ? 'pointer' : 'default'
                        }}
                        title={thumbImagePreview ? "클릭하여 원본 이미지 열기 (New Tab)" : ""}
                    >
                        {thumbImagePreview && thumbImageFile && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.3)', // Lighter overlay
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'center', alignItems: 'center', gap: '0.8rem', zIndex: 10,
                                transition: 'opacity 0.2s',
                                opacity: 0, // Hidden by default, shown on hover (handled by CSS or just keep simple)
                            }}
                                className="overlay-hover" // We can add a class or just keep it simple
                            >
                            </div>
                        )}

                        {thumbImagePreview && (
                            <div style={{
                                position: 'absolute', top: 10, right: 10, zIndex: 20
                            }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setThumbImagePreview(null);
                                        setThumbImageFile(null);
                                    }}
                                    className="btn-icon"
                                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #666', color: '#fff', fontSize: '0.7rem', padding: '4px 8px' }}
                                >
                                    ✕ 제거
                                </button>
                            </div>
                        )}

                        {thumbImagePreview && (
                            <div style={{
                                position: 'absolute', bottom: 10, left: 0, width: '100%',
                                pointerEvents: 'none' // Let clicks pass through to container
                            }}>
                                <span style={{
                                    background: 'rgba(0,0,0,0.7)',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <ExternalLink size={12} /> 클릭하여 크게 보기
                                </span>
                            </div>
                        )}

                        {!thumbImagePreview && (
                            <>
                                <ImageIcon size={32} style={{ color: '#666', marginBottom: '0.5rem' }} />
                                <span className="text-sm" style={{ color: '#888' }}>
                                    Drop image here or Click to upload
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    className="btn-accent mt-md"
                    style={{ fontSize: '1rem' }}
                >
                    썸네일 프롬프트 생성 (Viral Formula)
                </button>
            </div>

            {/* Result Area */}
            {result && (
                <div className="mt-lg fade-in">
                    <div className="flex-between mb-sm text-muted">
                        <span>생성된 전문가 프롬프트 (Editable)</span>
                        <div className="flex-row">
                            <button
                                onClick={handleOpenGemini}
                                className="btn-icon"
                                style={{ background: '#4dabf7', color: 'black', fontWeight: 'bold' }}
                            >
                                <ExternalLink size={14} /> Gemini 열기
                            </button>
                            <button
                                onClick={handleCopy}
                                className="btn-icon"
                                style={{ color: copied ? 'var(--color-accent)' : 'white' }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? '복사됨!' : '복사하기'}
                            </button>
                        </div>
                    </div>
                    {/* Editable Text Area for Result */}
                    <div className="result-box" style={{ borderLeftColor: 'var(--color-accent)', padding: 0 }}>
                        <textarea
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            className="textarea-primary"
                            style={{
                                width: '100%',
                                minHeight: '300px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
