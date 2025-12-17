import React, { useState } from 'react';
import { Send, Wand2 } from 'lucide-react';

interface PromptInputProps {
    onGenerate: (concept: string, style: string) => void;
    isGenerating: boolean;
}

const STYLES = [
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'photorealistic', label: 'Photorealistic' },
    { id: 'anime', label: 'Anime' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'dark-fantasy', label: 'Dark Fantasy' },
    { id: '3d-render', label: '3D Render' },
];

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating }) => {
    const [concept, setConcept] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('cinematic');

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '2rem',
    };

    const inputWrapperStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%'
    };

    const textAreaStyle: React.CSSProperties = {
        width: '100%',
        minHeight: '120px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '1.5rem',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        resize: 'vertical',
        transition: 'all 0.3s ease',
    };

    const chipsContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '0.8rem',
        flexWrap: 'wrap',
    };

    const buttonStyle: React.CSSProperties = {
        alignSelf: 'flex-end',
        backgroundColor: 'var(--color-primary)',
        color: '#000',
        padding: '1rem 2rem',
        borderRadius: '30px',
        fontWeight: 700,
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
        boxShadow: 'var(--glow-primary)',
        opacity: isGenerating ? 0.7 : 1,
    };

    return (
        <div className="glass-panel" style={containerStyle}>
            <div style={inputWrapperStyle}>
                <div style={{ marginBottom: '1rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wand2 size={18} />
                    <span>Core Concept</span>
                </div>
                <textarea
                    style={textAreaStyle}
                    placeholder="Describe your idea... (e.g., A futuristic car chase in a neon city)"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
            </div>

            <div>
                <div style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Vibe / Style</div>
                <div style={chipsContainerStyle}>
                    {STYLES.map(style => (
                        <button
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            style={{
                                padding: '0.5rem 1.2rem',
                                borderRadius: '20px',
                                border: selectedStyle === style.id ? '1px solid var(--color-secondary)' : '1px solid var(--color-border)',
                                backgroundColor: selectedStyle === style.id ? 'rgba(0, 204, 255, 0.1)' : 'transparent',
                                color: selectedStyle === style.id ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                                transition: 'all 0.2s',
                                boxShadow: selectedStyle === style.id ? 'var(--glow-secondary)' : 'none'
                            }}
                        >
                            {style.label}
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={() => onGenerate(concept, selectedStyle)} style={buttonStyle} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : (
                    <>
                        Generate Prompts <Send size={18} />
                    </>
                )}
            </button>
        </div>
    );
};
