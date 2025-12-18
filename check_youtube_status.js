import https from 'https';

const checkUrl = (url) => {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            console.log(`[${res.statusCode}] ${url}`);
            resolve(res.statusCode);
        });
        req.on('error', (e) => {
            console.error(`[ERROR] ${url}: ${e.message}`);
            resolve(500);
        });
        req.end();
    });
};

const run = async () => {
    console.log("--- Checking YouTube Thumbnail Responses ---");

    // 1. Known Good (Official YouTube Channel)
    await checkUrl('https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');

    // 2. User's Problem Video (Expected: 404 for maxres, 200 for hq)
    await checkUrl('https://i.ytimg.com/vi/dlE3suY0Uwg/maxresdefault.jpg');
    await checkUrl('https://i.ytimg.com/vi/dlE3suY0Uwg/hqdefault.jpg');

    // 3. Non-existent ID (Expected: 404)
    await checkUrl('https://i.ytimg.com/vi/NOT_A_REAL_ID_XYZ/maxresdefault.jpg');
};

run();
