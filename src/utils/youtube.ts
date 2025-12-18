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
        console.error('Invalid URL format', e);
    }
    return null;
};

export const getThumbnailUrls = (videoId: string) => {
    // Clean videoId just in case (remove trailing slashes or weird chars)
    const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');

    // v2.0: Use i.ytimg.com (Direct CDN) instead of img.youtube.com
    return {
        maxres: `https://i.ytimg.com/vi/${cleanId}/maxresdefault.jpg`,
        sd: `https://i.ytimg.com/vi/${cleanId}/sddefault.jpg`,
        hq: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
    };
};
