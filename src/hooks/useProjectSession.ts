import { useState, useEffect, useCallback } from 'react';

export interface ProjectData {
    topic: string;
    genre: string;
    duration: string;
    script: string;
    mood: string;
}

const STORAGE_KEY = 'prompt-muse-session-v1';
const DEBOUNCE_DELAY = 1000; // 1 second

export const useProjectSession = (initialData: ProjectData) => {
    const [projectData, setProjectData] = useState<ProjectData>(initialData);
    const [isLoaded, setIsLoaded] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load session on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with initial structure to ensure new fields don't break
                setProjectData(prev => ({ ...prev, ...parsed }));
                setLastSaved(new Date());
                console.log('✅ Session restored from LocalStorage');
            }
        } catch (e) {
            console.error('Failed to load session:', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Auto-save with debounce
    useEffect(() => {
        if (!isLoaded) return;

        const handler = setTimeout(() => {
            try {
                const json = JSON.stringify(projectData);
                localStorage.setItem(STORAGE_KEY, json);
                setLastSaved(new Date());
            } catch (e) {
                if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                    alert('⚠️ 브라우저 저장 공간이 가득 찼습니다. 자동 저장이 중지됩니다. 프로젝트를 내보내기(Export)하여 백업하세요.');
                } else {
                    console.error('Auto-save failed:', e);
                }
            }
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(handler);
    }, [projectData, isLoaded]);

    const clearSession = useCallback(() => {
        if (confirm('모든 작업 내용이 삭제되고 초기화됩니다. 계속하시겠습니까?')) {
            localStorage.removeItem(STORAGE_KEY);
            setProjectData(initialData);
            setLastSaved(null);
            // Optional: Force reload to clear component local states if needed
            // window.location.reload(); 
        }
    }, [initialData]);

    const exportSession = useCallback(() => {
        try {
            const json = JSON.stringify(projectData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prompt-muse-project-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('내보내기 중 오류가 발생했습니다.');
            console.error(e);
        }
    }, [projectData]);

    return {
        projectData,
        setProjectData,
        clearSession,
        exportSession,
        lastSaved,
        isLoaded
    };
};
