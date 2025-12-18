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
            'excited',      // Default Emotion
            'dynamic',      // Default Composition
            true,           // Default Text Space
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
                        {thumbImagePreview && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
                                justifyContent: 'center', alignItems: 'center', gap: '0.8rem', zIndex: 10
                            }}>
                                <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    이미지 준비됨 (Ready)
                                </div>
                                <button
                                    onClick={() => {
                                        setThumbImagePreview(null);
                                        setThumbImageFile(null);
                                    }}
                                    className="btn-icon"
                                    style={{ border: '1px solid #666', color: '#ccc', fontSize: '0.7rem' }}
                                >
                                    이미지 제거 (Clear)
                                </button>
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
                        <span>생성된 전문가 프롬프트 (Gemini)</span>
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
                    <div className="result-box" style={{ borderLeftColor: 'var(--color-accent)' }}>
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};
