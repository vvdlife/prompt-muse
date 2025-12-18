export const extractVideoId = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        // 1. Standard: youtube.com/watch?v=VID
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
            return urlObj.searchParams.get('v');
        }
        // 2. Shorts: youtube.com/shorts/VID
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/shorts/')) {
            const parts = urlObj.pathname.split('/');
            return parts[2] || null; // /shorts/vid -> parts[0]="", parts[1]="shorts", parts[2]="vid"
        }
        // 3. Shortened: youtu.be/VID
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
    } catch (e) {
        // Fallback for non-URL strings if user just pastes ID? (Optional)
        // For now, assume full URL
        console.error('Invalid URL format', e);
    }
    return null;
};

export const getThumbnailUrls = (videoId: string) => {
    return {
        maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        sd: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
};
