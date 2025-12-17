import React, { useState } from 'react';
import { generateMidjourneyExpertPrompt, generateVeoExpertPrompt } from '../../generators';
import { Copy, Check, Info } from 'lucide-react';

interface AssetModeProps {
    platform: 'midjourney' | 'veo3';
}

export const AssetMode: React.FC<AssetModeProps> = ({ platform }) => {
    const [description, setDescription] = useState('');
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    // Midjourney States
    const [ar, setAr] = useState('16:9');
    const [stylize, setStylize] = useState(250);
    const [weird, setWeird] = useState(0);

    // Veo3 States
    const [camera, setCamera] = useState('Cinematic drone shot');
    const [resolution, setResolution] = useState<'1080p' | '4k'>('4k');
    const [useAudio, setUseAudio] = useState(true);

    const handleGenerate = () => {
        let prompt = '';
        if (platform === 'midjourney') {
            prompt = generateMidjourneyExpertPrompt(description, ar, stylize, weird);
        } else {
            prompt = generateVeoExpertPrompt(description, camera, resolution, useAudio);
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

                {/* Platform Specific Controls */}
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={16} /> 전문가 설정 ({platform === 'midjourney' ? 'Parameter Tuning' : 'Camera & Audio'})
                    </h4>

                    {platform === 'midjourney' ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>종횡비 (--ar)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                                        스타일 강도 (--stylize) <span>{stylize}</span>
                                    </label>
                                    <input type="range" min="0" max="1000" value={stylize} onChange={(e) => setStylize(Number(e.target.value))} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        기괴함 (--weird) <span>{weird}</span>
                                    </label>
                                    <input type="range" min="0" max="3000" value={weird} onChange={(e) => setWeird(Number(e.target.value))} style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Veo3 Controls
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
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>설정</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={useAudio} onChange={(e) => setUseAudio(e.target.checked)} />
                                        오디오 프롬프트 포함
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
                    {platform === 'midjourney' ? '이미지 생성 프롬프트 만들기' : '비디오 생성 프롬프트 만들기'}
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
        </div>
    );
};
