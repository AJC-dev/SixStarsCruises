import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error('JWT_SECRET is not set in environment variables.');
        return response.status(500).send("Server configuration error.");
    }

    try {
        const { token } = request.query;

        if (!token) {
            return response.status(400).send("Missing verification token.");
        }

        // Verify the token and extract the postcard data
        const postcardData = jwt.verify(token, jwtSecret);
        const { sender, recipient, frontImageUrl, backImageUrl } = postcardData;

        // --- ZAP~POST API LOGIC ---
        const zapUsername = process.env.ZAPPOST_USERNAME;
        const zapPassword = process.env.ZAPPOST_PASSWORD;
        const zapCampaignId = process.env.ZAPPOST_CAMPAIGN_ID;
        
        const customerId = `${sender.email}${recipient.postcode.replace(/\s/g, '')}`;

        const apiPayload = {
            campaignId: zapCampaignId,
            scheduledSendDateId: "",
            onlyValidRecords: true,
            submissions: [
                {
                    customerid: customerId,
                    email: sender.email,
                    salutation: "",
                    firstname: recipient.name,
                    surname: "",
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
                        "message": backImageUrl, // This is the back image WITHOUT address
                        "sender": sender.name
                    }
                }
            ]
        };

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
            throw new Error(`The print service returned an error.`);
        }
        
        // --- SEND FINAL CONFIRMATION EMAIL ---
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
                <div style="max-width: 300px; margin: 20px auto 0; text-align: center;">
                    <a href="https://postcard-f9e4.vercel.app/?sendAgain=true" style="display: block; background-color: #0f61e6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 10px;">Send again, to someone else?</a>
                    <a href="https://www.jet2.com/myjet2.aspx" target="_blank" style="display: block; background-color: #e82011; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">JOIN MYJET2</a>
                </div>
                <div style="text-align: right; margin-top: 30px;">
                    <p style="margin: 0; font-size: 12px; color: #555;">Powered by</p>
                    <a href="https://zappost.com" target="_blank">
                        <img src="https://postcard-f9e4.vercel.app/logo.png" alt="ZAP~POST Logo" style="width: 150px;"/>
                    </a>
                </div>
            </div>
        `;

        const msg = {
            to: sender.email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: "Jet2"
            },
            subject: 'Your Postcard Confirmation',
            html: emailHtml,
        };

        await sgMail.send(msg);

        // Redirect to the success page
        response.writeHead(302, { Location: '/success.html' });
        response.end();

    } catch (error) {
        console.error('Error in verify-and-send function:', error);
        return response.status(500).send("An error occurred during verification.");
    }
}
