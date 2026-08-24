import { Resend } from 'resend'
import AdminSettings from '../models/AdminSettings.model.js'

export const sendContactEmail = async ({ name, email, phone, subject, message }) => {
  const settings = await AdminSettings.findOne().lean()
  const recipientEmail = settings?.supportEmail || process.env.ADMIN_EMAIL || 'scanqrandprint@gmail.com'

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Resend Email Service]: RESEND_API_KEY is not set in .env. Contact message logged:', {
      to: recipientEmail,
      from: email,
      name,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })
    return { success: true, warning: 'Email simulated (RESEND_API_KEY not configured)' }
  }

  try {
    const resend = new Resend(apiKey)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Scan&Print <onboarding@resend.dev>'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f6f7; margin: 0; padding: 20px; color: #1c1917; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
            .body { padding: 28px; }
            .badge { display: inline-block; background-color: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
            .field { margin-bottom: 16px; }
            .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #78716c; margin-bottom: 4px; letter-spacing: 0.5px; }
            .value { font-size: 14px; font-weight: 600; color: #1c1917; background-color: #fafaf9; padding: 10px 14px; border-radius: 8px; border: 1px solid #f5f5f4; }
            .message-box { font-size: 14px; line-height: 1.6; color: #292524; background-color: #f5f5f4; padding: 14px; border-radius: 10px; border-left: 4px solid #e11d48; margin-top: 8px; white-space: pre-wrap; }
            .footer { background-color: #f5f5f4; padding: 16px 24px; text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #e7e5e4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Inquiry</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Scan&Print Smart Network</p>
            </div>
            <div class="body">
              <span class="badge">${subject || 'General Inquiry'}</span>
              
              <div class="field">
                <div class="label">Sender Name</div>
                <div class="value">${name}</div>
              </div>

              <div class="field">
                <div class="label">Email Address</div>
                <div class="value"><a href="mailto:${email}" style="color: #e11d48; text-decoration: none;">${email}</a></div>
              </div>

              <div class="field">
                <div class="label">Phone / WhatsApp</div>
                <div class="value"><a href="tel:${phone}" style="color: #059669; text-decoration: none;">${phone || 'Not provided'}</a></div>
              </div>

              <div class="field">
                <div class="label">Subject</div>
                <div class="value">${subject || 'General Inquiry'}</div>
              </div>

              <div class="field">
                <div class="label">Message</div>
                <div class="message-box">${message}</div>
              </div>
            </div>
            <div class="footer">
              Delivered to Admin Support: <strong>${recipientEmail}</strong><br>
              Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </div>
          </div>
        </body>
      </html>
    `

    const response = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      replyTo: email,
      subject: `[Scan&Print Contact] ${subject || 'New Message'} from ${name}`,
      html: htmlContent,
    })

    if (response.error) {
      console.warn('[Resend API Warning]:', response.error)
      console.info('[Contact Inquiry Saved to Logs]:', { name, email, phone, subject, message })
      return { success: true, warning: response.error.message }
    }

    return { success: true, data: response.data }
  } catch (err) {
    console.error('[Resend Service Error]:', err.message)
    console.info('[Contact Inquiry Saved to Logs]:', { name, email, phone, subject, message })
    return { success: true, warning: err.message }
  }
}
