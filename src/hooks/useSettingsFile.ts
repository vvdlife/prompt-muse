import { useCallback } from 'react';

/**
 * Hook to handle exporting and importing component state as JSON files.
 */
export const useSettingsFile = <T>(currentSettings: T, onImport: (data: T) => void) => {

    const exportSettings = useCallback((filename: string) => {
        const dataStr = JSON.stringify(currentSettings, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_settings_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [currentSettings]);

    const importSettings = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                if (event.target?.result) {
                    const parsed = JSON.parse(event.target.result as string);
                    // Minimal validation could be added here
                    onImport(parsed);
                    alert('설정을 성공적으로 불러왔습니다!');
                }
            } catch (err) {
                console.error('Failed to parse JSON settings', err);
                alert('설정 파일을 읽는 도중 오류가 발생했습니다. 올바른 JSON 파일인지 확인해주세요.');
            }
        };
        reader.readAsText(file);
        // Reset input value so same file can be selected again
        e.target.value = '';
    }, [onImport]);

    return { exportSettings, importSettings };
};
