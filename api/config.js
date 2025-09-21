export default function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const publicConfig = {
            recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            pixabayApiKey: process.env.NEXT_PUBLIC_PIXABAY_API_KEY
        };

        if (!publicConfig.recaptchaSiteKey || !publicConfig.pixabayApiKey) {
            console.error('Public environment variables are not set correctly in Vercel. Ensure they are prefixed with NEXT_PUBLIC_');
            return response.status(500).json({ message: 'Server configuration error: Missing public API keys.' });
        }

        return response.status(200).json(publicConfig);

    } catch (error) {
        console.error('Error in config function:', error);
        return response.status(500).json({ message: 'An internal server error occurred.' });
    }
}

