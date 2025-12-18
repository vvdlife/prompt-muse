import React, { useState } from 'react';
import { extractVideoId, getThumbnailUrls } from '../utils/youtube';
import { Search, Check } from 'lucide-react';

interface YoutubeExtractorProps {
    onExtract?: (url: string) => void;
    onApplyStyle?: (url: string) => void;
}

export const YoutubeExtractor: React.FC<YoutubeExtractorProps> = ({ onExtract, onApplyStyle }) => {
    const [url, setUrl] = useState('');
    const [videoId, setVideoId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [extractedUrl, setExtractedUrl] = useState<string | null>(null);
    const [retry, setRetry] = useState(false);

    const handleExtract = () => {
        setError('');
        setExtractedUrl(null);
        setVideoId(null);
        setRetry(false);

        const id = extractVideoId(url);
        if (!id) {
            setError('유효하지 않은 YouTube URL입니다.');
            return;
        }

        setVideoId(id);
        const thumbs = getThumbnailUrls(id);
        // Default to maxres, will fallback if image fails load? 
        // For simplicity, we assume maxres exists or user accepts lower quality.
        // But to be safe, we can try to display maxres.
        setExtractedUrl(thumbs.maxres);
        if (onExtract) onExtract(thumbs.maxres);
    };

    const handleApply = () => {
        if (extractedUrl && onApplyStyle) {
            onApplyStyle(extractedUrl);
        }
    };

    return (
        <div style={{ padding: '1.5rem', background: 'rgba(255, 69, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 69, 0, 0.3)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#ff4500', fontWeight: 'bold', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} /> YouTube 썸네일 스타일 추출
            </h4>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="YouTube URL 입력 (https://...)"
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '6px', background: '#222', color: 'white', border: '1px solid #444' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleExtract(); }}
                />
                <button
                    onClick={handleExtract}
                    style={{
                        padding: '0 1.2rem',
                        borderRadius: '6px',
                        background: '#ff4500',
                        color: 'white',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    추출
                </button>
            </div>

            {error && <div style={{ color: '#ff6b6b', fontSize: '0.9rem', marginTop: '0.5rem' }}>⚠️ {error}</div>}
            {retry && !error && <div style={{ color: '#ffad33', fontSize: '0.9rem', marginTop: '0.5rem' }}>⚡ 고화질 썸네일이 없어 표준 화질로 전환합니다...</div>}

            {extractedUrl && (
                <div style={{ animation: 'fadeIn 0.5s', marginTop: '1rem' }}>
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444', aspectRatio: '16/9', background: '#000' }}>
                        <img
                            key={extractedUrl} // Force re-mount on URL change to reset error state
                            src={extractedUrl}
                            alt="Extracted Thumbnail"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!videoId) return;

                                // Fallback: maxres -> hqdefault (Safe bet)
                                if (target.src.includes('maxresdefault')) {
                                    setRetry(true);
                                    const nextSrc = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                    setExtractedUrl(nextSrc);
                                } else {
                                    setRetry(false);
                                    setError('썸네일을 불러올 수 없습니다.');
                                }
                            }}
                        />
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleApply}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '25px',
                                background: 'linear-gradient(90deg, #ff4500, #ff8c00)',
                                color: 'white',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(255, 69, 0, 0.3)'
                            }}
                        >
                            <Check size={18} /> 이 스타일로 만들기 (Apply Style)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
