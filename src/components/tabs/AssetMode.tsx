import React, { useState, useEffect } from 'react';
import { ThumbnailStudio } from '../studios/ThumbnailStudio';
import { VideoStudio } from '../studios/VideoStudio';
import { ArtStudio } from '../studios/ArtStudio';
import { Image as ImageIcon, LayoutTemplate, Clapperboard, Palette } from 'lucide-react';
import '../../App.css';

interface AssetModeProps {
    platform: 'midjourney' | 'veo3';
    fixedAssetType?: 'default' | 'thumbnail';
    initialContext?: string;
    initialTopic?: string;
}

export const AssetMode: React.FC<AssetModeProps> = ({ platform, fixedAssetType, initialContext = '', initialTopic = '' }) => {
    const [assetType, setAssetType] = useState<'default' | 'thumbnail'>(fixedAssetType || 'default');

    // Platform routing (Video vs Art vs Thumbnail)
    const [localPlatform, setLocalPlatform] = useState<'midjourney' | 'veo3'>(platform);

    useEffect(() => { setLocalPlatform(platform); }, [platform]);

    // Render Logic Simplified: strictly routing based on mode
    if (assetType === 'thumbnail') {
        return (
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
                <div className="flex-between mb-md">
                    <div />
                    {!fixedAssetType && (
                        <div className="toggle-group">
                            <button
                                onClick={() => setAssetType('default')}
                                className="btn-toggle"
                            >
                                <ImageIcon size={16} /> 일반 에셋
                            </button>
                            <button
                                onClick={() => setAssetType('thumbnail')}
                                className="btn-toggle active-accent"
                            >
                                <LayoutTemplate size={16} /> 썸네일
                            </button>
                        </div>
                    )}
                </div>
                {/* 썸네일 스튜디오 */}
                <ThumbnailStudio initialTopic={initialTopic || initialContext} />
            </div>
        )
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
            <h3 className="text-gradient flex-row mb-md" style={{ fontSize: '1.5rem' }}>
                {localPlatform === 'midjourney' ? <Palette /> : <Clapperboard />}
                {localPlatform === 'midjourney' ? 'Midjourney Art Studio' : 'Veo3 Video Studio'}
            </h3>

            {!fixedAssetType && (
                <div className="toggle-group mb-md">
                    <button
                        onClick={() => setAssetType('default')}
                        className={`btn-toggle ${assetType === 'default' ? 'active-secondary' : ''}`}
                    >
                        <ImageIcon size={18} /> 일반 에셋
                    </button>
                    <button
                        onClick={() => setAssetType('thumbnail')}
                        className="btn-toggle"
                    >
                        <LayoutTemplate size={18} /> 썸네일 스튜디오
                    </button>
                </div>
            )}

            {/* Platform Switcher */}
            <div className="panel-sub mb-lg">
                <div className="grid-cols-2">
                    <button
                        onClick={() => setLocalPlatform('veo3')}
                        className={`btn-toggle ${localPlatform === 'veo3' ? 'active-secondary' : ''}`}
                        style={{ background: localPlatform === 'veo3' ? 'rgba(0, 255, 136, 0.2)' : 'transparent', border: localPlatform === 'veo3' ? '1px solid var(--color-secondary)' : '1px solid #444' }}
                    >
                        <Clapperboard size={18} /> Video (Veo3)
                    </button>
                    <button
                        onClick={() => setLocalPlatform('midjourney')}
                        className={`btn-toggle ${localPlatform === 'midjourney' ? 'active-accent' : ''}`}
                        style={{ background: localPlatform === 'midjourney' ? 'rgba(255, 0, 255, 0.2)' : 'transparent', border: localPlatform === 'midjourney' ? '1px solid var(--color-accent)' : '1px solid #444' }}
                    >
                        <Palette size={18} /> Image (Midjourney)
                    </button>
                </div>
            </div>

            {/* Route to specific studio based on platform */}
            {localPlatform === 'midjourney' ? (
                <ArtStudio initialContext={initialContext} />
            ) : (
                <VideoStudio initialContext={initialContext} />
            )}
        </div >
    );
};
