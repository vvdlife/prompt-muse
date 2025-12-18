export const config = {
    runtime: 'edge', // Edge function for speed
};

export default async function handler(req: Request) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return new Response(JSON.stringify({ error: 'Video ID required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Checking order: MaxRes -> SD -> HQ -> MQ (Final fallback)
    const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault'];

    for (const quality of qualities) {
        const url = `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
        try {
            // Using HEAD request to avoid downloading body, just checking status
            const res = await fetch(url, { method: 'HEAD' });
            if (res.status === 200) {
                return new Response(JSON.stringify({
                    success: true,
                    url: url,
                    quality: quality
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        } catch (e) {
            console.error(`Check failed for ${url}:`, e);
            // Continue to next quality
        }
    }

    // If all fail
    return new Response(JSON.stringify({
        success: false,
        error: 'No valid thumbnail found'
    }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
    });
}
