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
                <h2>Thank you for sending a postcard!</h2>
                <p>Hi ${sender.name},</p>
                <p>Here's what you sent. We'll print and mail it to ${recipient.name} - it should land in the next few days.</p>
                <hr>
                <h3>Your Design:</h3>
                <h4>Front:</h4>
                <img src="${frontImageUrl}" alt="Postcard Front" style="max-width: 300px; border: 1px solid #ccc;"/>
                <h4>Back:</h4>
                <img src="${backImageUrl}" alt="Postcard Back" style="max-width: 300px; border: 1px solid #ccc;"/>
                <hr style="margin-top: 20px;">
                <div style="text-align: center; margin-top: 20px;">
                    <a href="/?sendAgain=true" style="display: block; background-color: #22c55e; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 10px;">Send again, to someone else?</a>
                    <a href="https://zappost.com" target="_blank" style="display: block; background-color: #22c55e; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Send 1000's like this</a>
                </div>
                <div style="text-align: right; margin-top: 30px;">
                    <p style="margin: 0; font-size: 12px; color: #555;">Powered by</p>
                    <a href="https://zappost.com" target="_blank">
                        <img src="https://postcard-f9e4.vercel.app/Logo.png" alt="ZAP~POST Logo" style="width: 150px;"/>
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
            subject: 'Your Postcard Confirmation',
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
