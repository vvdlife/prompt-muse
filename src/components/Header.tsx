import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="header-container">
            <h1 className="header-title">
                <Sparkles size={40} color="var(--color-primary)" />
                PromptMuse
            </h1>
            <p className="header-subtitle">
                Unleash your creativity with professional-grade AI prompts
            </p>
        </header>
    );
};
