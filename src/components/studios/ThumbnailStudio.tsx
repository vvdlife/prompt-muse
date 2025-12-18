import React, { useState } from 'react';
import { generateGeminiThumbnailPrompt } from '../../generators';
import { YoutubeExtractor } from '../YoutubeExtractor';
import { Copy, Check, LayoutTemplate, ExternalLink, Image as ImageIcon, Download, Upload } from 'lucide-react';
import { useSettingsFile } from '../../hooks/useSettingsFile';
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
    const [emotion, setEmotion] = useState('Excited');
    const [composition, setComposition] = useState('Dynamic');
    const [textSpace, setTextSpace] = useState(true);

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
            thumbCustomInstruction
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
                            <option value="Excited">🤩 Excited (신난/흥분된)</option>
                            <option value="Shocked">😱 Shocked (충격적인)</option>
                            <option value="Curious">🤔 Curious (궁금한/의문)</option>
                            <option value="Angry">😡 Angry (화난/비판적)</option>
                            <option value="Happy">😊 Happy (행복한/긍정적)</option>
                            <option value="Sad">😢 Sad (슬픈/감성적)</option>
                            <option value="Professional">👔 Professional (전문적인)</option>
                            <option value="Dark">🌑 Dark (어두운/진지한)</option>
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
                            <option value="Dynamic">⚡ Dynamic (역동적)</option>
                            <option value="Rule of Thirds">📐 Rule of Thirds (3분할)</option>
                            <option value="Center">🎯 Center (중앙 집중)</option>
                            <option value="Close-up">🔍 Close-up (클로즈업)</option>
                            <option value="Wide Shot">🏞️ Wide Shot (와이드 샷)</option>
                            <option value="Diagonal">📉 Diagonal (대각선 구도)</option>
                            <option value="Symmetry">⚖️ Symmetry (대칭)</option>
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
                    onApplyStyle={async (url) => {
                        try {
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
