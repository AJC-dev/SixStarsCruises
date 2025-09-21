export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { sender, recipient, frontImageUrl, backImageUrl, recaptchaToken } = request.body;

        // --- Environment Variable Check ---
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        const zapUsername = process.env.ZAPPOST_USERNAME;
        const zapPassword = process.env.ZAPPOST_PASSWORD;
        const zapCampaignId = process.env.ZAPPOST_CAMPAIGN_ID;

        if (!recaptchaSecret || !zapUsername || !zapPassword || !zapCampaignId) {
            console.error('One or more environment variables are missing!');
            return response.status(500).json({ success: false, message: 'Server configuration error. Required API keys are not set.' });
        }

        // --- reCAPTCHA Verification ---
        if (!recaptchaToken) {
            return response.status(400).json({ success: false, message: 'reCAPTCHA verification missing.' });
        }
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`;
        const recaptchaResponse = await fetch(verificationUrl, { method: 'POST' });
        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success) {
            return response.status(400).json({ success: false, message: 'reCAPTCHA verification failed.' });
        }
        
        // --- Data Validation ---
        if (!sender || !sender.name || !sender.email || 
            !recipient || !recipient.name || !recipient.line1 || !recipient.city || !recipient.postcode ||
            !frontImageUrl || !backImageUrl) {
            return response.status(400).json({ success: false, message: 'Missing required fields.' });
        }
        
        // --- Prepare data for ZAP~POST API ---
        const apiPayload = {
            campaignId: zapCampaignId,
            scheduledSendDateId: "",
            onlyValidRecords: true,
            submissions: [
                {
                    customerid: sender.email,
                    email: sender.email,
                    salutation: "",
                    firstname: recipient.name, // Use the full name here
                    surname: "", // Send surname as an empty string
                    companyname: "",
                    address1: recipient.line1,
                    address2: recipient.line2 || "",
                    address3: "",
                    city: recipient.city,
                    postcode: recipient.postcode,
                    country: recipient.country,
                    currency: "GBP",
                    language: "en",
                    customdata: {
                        "front": frontImageUrl,
                        "message": backImageUrl,
                        "sender": sender.name
                    }
                }
            ]
        };

        // --- Authenticate and Send to ZAP~POST ---
        const basicAuth = Buffer.from(`${zapUsername}:${zapPassword}`).toString('base64');

        const zapostResponse = await fetch('https://api.zappost.com/api/v1/records', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify(apiPayload)
        });

        if (zapostResponse.status !== 200) {
            const errorText = await zapostResponse.text();
            console.error('ZAP~POST API Error:', errorText);
            throw new Error(`The print service returned an error: ${zapostResponse.statusText} (${zapostResponse.status})`);
        }

        // --- Send Success Response ---
        return response.status(200).json({ success: true, message: 'Postcard successfully sent for printing.' });

    } catch (error) {
        console.error('Error in send-postcard function:', error);
        return response.status(500).json({ success: false, message: error.message || 'An internal server error occurred.' });
    }
}