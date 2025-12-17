import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: '3rem',
        paddingTop: '2rem'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '3.5rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
    };

    return (
        <header style={headerStyle}>
            <h1 className="text-gradient" style={titleStyle}>
                <Sparkles size={48} color="var(--color-primary)" />
                PromptMuse
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
                Unleash your creativity with professional-grade AI prompts
            </p>
        </header>
    );
};
