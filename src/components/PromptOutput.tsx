import React, { useState } from 'react';
import { Copy, Check, Terminal, Image as ImageIcon, Video } from 'lucide-react';
import type { PromptResult } from '../generators';

interface PromptOutputProps {
    results: PromptResult[];
}

export const PromptOutput: React.FC<PromptOutputProps> = ({ results }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getIcon = (platform: string) => {
        switch (platform) {
            case 'chatgpt': return <Terminal size={20} />;
            case 'midjourney': return <ImageIcon size={20} />;
            case 'veo3': return <Video size={20} />;
            default: return <Terminal size={20} />;
        }
    };

    const getLabel = (platform: string) => {
        switch (platform) {
            case 'chatgpt': return 'ChatGPT / Gemini (Logic)';
            case 'midjourney': return 'Midjourney (Image)';
            case 'veo3': return 'Veo 3 (Video + Audio)';
            default: return platform;
        }
    };

    if (!results.length) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            {results.map((result, index) => (
                <div key={result.platform} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.8rem' }}>
                        <span style={{ color: 'var(--color-primary)' }}>{getIcon(result.platform)}</span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{getLabel(result.platform)}</h3>
                    </div>

                    <div style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        overflowY: 'auto',
                        maxHeight: '300px',
                        whiteSpace: 'pre-wrap',
                        color: '#e0e0e0'
                    }}>
                        {result.content}
                    </div>

                    <button
                        onClick={() => handleCopy(result.content, index)}
                        style={{
                            alignSelf: 'flex-end',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '6px',
                            backgroundColor: copiedIndex === index ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                            color: copiedIndex === index ? '#000' : '#fff',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                            border: '1px solid transparent',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                            if (copiedIndex !== index) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                        }}
                        onMouseOut={(e) => {
                            if (copiedIndex !== index) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                        }}
                    >
                        {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                        {copiedIndex === index ? 'Copied!' : 'Copy Prompt'}
                    </button>
                </div>
            ))}
        </div>
    );
};
