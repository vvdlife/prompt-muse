import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.body || req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await fetch(url as string, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

        // Extract keywords (meta keywords or from content)
        const keywords = $('meta[name="keywords"]').attr('content') || '';

        // Extract representative image
        const image = $('meta[property="og:image"]').attr('content') || '';

        res.status(200).json({
            success: true,
            data: {
                title: title.trim(),
                description: description.trim(),
                keywords: keywords.trim(),
                image
            }
        });

    } catch (error: any) {
        console.error('URL Analyze Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze URL',
            details: error.message
        });
    }
}
