import { useState, useEffect } from 'react';

export interface Preset<T> {
    id: string;
    name: string;
    data: T;
}

export function usePresets<T>(key: string) {
    const [presets, setPresets] = useState<Preset<T>[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                setPresets(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse presets', e);
            }
        }
    }, [key]);

    const savePreset = (name: string, data: T) => {
        const newPreset = { id: Date.now().toString(), name, data };
        const updated = [...presets, newPreset];
        setPresets(updated);
        localStorage.setItem(key, JSON.stringify(updated));
    };

    const deletePreset = (id: string) => {
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        localStorage.setItem(key, JSON.stringify(updated));
    };

    return { presets, savePreset, deletePreset };
}
