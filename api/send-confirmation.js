// Import the SendGrid mail library
import sgMail from '@sendgrid/mail';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // Set the API key from Vercel's environment variables
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    try {
        const { sender, recipient, frontImageUrl, backImageUrl } = request.body;

        // Basic validation
        if (!sender || !recipient || !frontImageUrl || !backImageUrl) {
            return response.status(400).json({ success: false, message: 'Missing required data for email confirmation.' });
        }

        // Construct the HTML for the email
        const emailHtml = `
            <div style="font-family: sans-serif; line-height: 1.6;">
                <h2>Thank you ${sender.name}</h2>
                <p>Here's what you sent to ${recipient.name} - it should land in the next few days.</p>
                 <div style="margin-top: 20px; display: flex; justify-content: center; align-items: center;">
                    <img src="${frontImageUrlForEmail}" alt="Postcard Front" style="max-width: 200px; border: 1px solid #ccc; margin: 5px;"/>
                    <img src="${backImageUrlWithAddress}" alt="Postcard Back" style="max-width: 200px; border: 1px solid #ccc; margin: 5px;"/>
                </div>
                
                    <a href="/?sendAgain=true" style="display: block; background-color: #b9965b; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 10px;">Send again, to someone else?</a>
                    <a href="https://www.sixstarcruises.co.uk/luxury-cruises-2026/" target="_blank" style="display: block; background-color: #062b3f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">2026 Cruises - Spectacular Savings Event</a>
                </div>
                <div style="text-align: right; margin-top: 30px;">
                    <p style="margin: 0; font-size: 12px; color: #555;">Powered by</p>
                    <a href="https://zappost.com" target="_blank">
                        <img src="Logo.png" alt="ZAP~POST Logo" style="width: 100px;"/>
                    </a>
                </div>
            </div>
        `;

        const msg = {
            to: sender.email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: "ZAP~POST - Free postcard"
            },
            subject: 'Postcard sent to ${recipient.name}',
            html: emailHtml,
        };

        await sgMail.send(msg);

        return response.status(200).json({ success: true });

    } catch (error) {
        console.error('Error sending confirmation email:', error);
        // If SendGrid returns detailed errors, they might be in error.response.body
        if (error.response) {
            console.error(error.response.body)
        }
        return response.status(500).json({ success: false, message: 'Failed to send confirmation email.' });
    }
}
