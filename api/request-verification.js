import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error('JWT_SECRET is not set in environment variables.');
        return response.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    try {
        const { postcardData } = request.body;

        if (!postcardData || !postcardData.sender || !postcardData.sender.email) {
            return response.status(400).json({ success: false, message: 'Missing required data.' });
        }

        const { sender, recipient, frontImageUrl, backImageUrlWithAddress } = postcardData;

        // Create a short-lived token containing the postcard data
        const token = jwt.sign(postcardData, jwtSecret, { expiresIn: '1h' });

        const verificationUrl = `https://${request.headers.host}/api/verify-and-send?token=${token}`;

        const emailHtml = `
            <div style="font-family: sans-serif; line-height: 1.6; text-align: center; max-width: 500px; margin: auto;">
                <h2>Hi ${sender.name},</h2>
                <p>To send ${recipient.name}'s postcard, click below:</p>
                <div style="margin: 20px 0;">
                    <a href="${verificationUrl}" style="background-color: #0f61e6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Send Postcard</a>
                </div>
                <div style="margin-top: 20px;">
                    <img src="${frontImageUrl}" alt="Postcard Front" style="max-width: 200px; border: 1px solid #ccc; margin: 5px;"/>
                    <img src="${backImageUrlWithAddress}" alt="Postcard Back" style="max-width: 200px; border: 1px solid #ccc; margin: 5px;"/>
                </div>
            </div>
        `;

        const msg = {
            to: sender.email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: "Jet2"
            },
            subject: `Send ${recipient.name}'s Postcard`,
            html: emailHtml,
        };

        await sgMail.send(msg);

        return response.status(200).json({ success: true, message: 'Verification email sent.' });

    } catch (error) {
        console.error('Error in request-verification function:', error);
        return response.status(500).json({ success: false, message: 'Failed to send verification email.' });
    }
}
