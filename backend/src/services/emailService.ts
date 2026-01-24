/**
 * Email Service
 * Handles sending emails via SendGrid
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mypromises.app';
const APP_NAME = 'MyPromises';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✓ SendGrid email service initialized');
} else {
  console.warn('⚠️ SendGrid API key not configured: SENDGRID_API_KEY missing');
}

export class EmailService {
  /**
   * Send email using SendGrid
   */
  private static async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
    if (!SENDGRID_API_KEY) {
      console.error('❌ SendGrid not configured! SENDGRID_API_KEY is missing. Email NOT sent to:', to);
      console.error('   Please set SENDGRID_API_KEY environment variable in Railway');
      return;
    }

    if (!FROM_EMAIL) {
      console.error('❌ FROM_EMAIL not configured! Email NOT sent to:', to);
      return;
    }

    try {
      console.log(`📧 Attempting to send email to: ${to} from: ${FROM_EMAIL}`);
      const result = await sgMail.send({
        to,
        from: FROM_EMAIL,
        subject,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        html,
      });
      console.log(`✓ Email successfully sent to ${to}`);
      console.log(`  Status code: ${result[0]?.statusCode || 'unknown'}`);
    } catch (error: any) {
      console.error('❌ Error sending email to:', to);
      console.error('   Error message:', error.message);
      
      // Don't throw - we don't want email failures to break promise creation
      if (error.response) {
        console.error('   SendGrid status code:', error.response.statusCode);
        console.error('   SendGrid error details:', JSON.stringify(error.response.body, null, 2));
        
        // Common SendGrid errors
        if (error.response.body?.errors) {
          error.response.body.errors.forEach((err: any) => {
            console.error(`   - ${err.message} (field: ${err.field || 'N/A'})`);
          });
        }
      } else {
        console.error('   Full error:', error);
      }
    }
  }

  /**
   * Send promise invitation email to promisee
   */
  static async sendPromiseInvitation(
    promiseeEmail: string,
    promiserName: string,
    promiseTitle: string,
    promiseDescription?: string,
    promiseId?: string
  ): Promise<void> {
    // Use static app URL
    const appUrl = 'http://mypromises.app';
    const signUpUrl = `${appUrl}/signup?email=${encodeURIComponent(promiseeEmail)}${promiseId ? `&promise=${promiseId}` : ''}`;
    
    console.log(`📧 Generated signup URL: ${signUpUrl}`);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You Have a New Promise</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7f8;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        ${APP_NAME}
                      </h1>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 400;">
                        Keep your word. Build trust.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 24px; font-weight: 600; line-height: 1.3;">
                        You have a new promise!
                      </h2>
                      
                      <p style="margin: 0 0 24px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                        <strong style="color: #0f172a;">${promiserName}</strong> has made a promise to you.
                      </p>
                      
                      <!-- Promise Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7f8; border-radius: 8px; border-left: 4px solid #14b8a6; margin: 0 0 32px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 600; line-height: 1.4;">
                              ${promiseTitle}
                            </h3>
                            ${promiseDescription ? `<p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.6;">${promiseDescription}</p>` : ''}
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 32px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                        Join ${APP_NAME} to view and track this promise, and help ${promiserName} stay accountable.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                        <tr>
                          <td align="center" style="padding: 0;">
                            <a href="${signUpUrl}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);">
                              Join ${APP_NAME} Now
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
                        If you're already a member, you can view this promise in your dashboard.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 30px; background-color: #f5f7f8; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
                        This email was sent to ${promiseeEmail}.<br>
                        If you didn't expect this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `
${APP_NAME}
Keep your word. Build trust.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have a new promise!

${promiserName} has made a promise to you:

${promiseTitle}
${promiseDescription ? `\n${promiseDescription}\n` : ''}

Join ${APP_NAME} to view and track this promise, and help ${promiserName} stay accountable!

Sign up here: ${signUpUrl}

If you're already a member, you can view this promise in your dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This email was sent to ${promiseeEmail}.
If you didn't expect this email, you can safely ignore it.
    `;

    await this.sendEmail(
      promiseeEmail,
      `${promiserName} made a promise to you: ${promiseTitle}`,
      html,
      text
    );
  }

  /**
   * Send mentorship invitation email to mentor
   */
  static async sendMentorshipInvitation(
    mentorEmail: string,
    promiserName: string,
    promiseTitle: string,
    promiseDescription?: string,
    promiseId?: string
  ): Promise<void> {
    // Use static app URL
    const appUrl = 'http://mypromises.app';
    const signUpUrl = `${appUrl}/signup?email=${encodeURIComponent(mentorEmail)}${promiseId ? `&promise=${promiseId}` : ''}`;
    
    console.log(`📧 Generated signup URL: ${signUpUrl}`);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mentorship Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7f8;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        ${APP_NAME}
                      </h1>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 400;">
                        Keep your word. Build trust.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 24px; font-weight: 600; line-height: 1.3;">
                        Mentorship Invitation
                      </h2>
                      
                      <p style="margin: 0 0 24px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                        <strong style="color: #0f172a;">${promiserName}</strong> has invited you to be a mentor for their promise.
                      </p>
                      
                      <!-- Promise Card -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7f8; border-radius: 8px; border-left: 4px solid #14b8a6; margin: 0 0 32px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 600; line-height: 1.4;">
                              ${promiseTitle}
                            </h3>
                            ${promiseDescription ? `<p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.6;">${promiseDescription}</p>` : ''}
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                        As a mentor, you'll be able to:
                      </p>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                        <tr>
                          <td style="padding: 0;">
                            <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 15px; line-height: 1.8;">
                              <li style="margin-bottom: 8px;">View the promise and its progress</li>
                              <li style="margin-bottom: 8px;">Add notes and encouragement</li>
                              <li>Help ${promiserName} stay accountable</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 32px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                        Join ${APP_NAME} to accept this mentorship invitation!
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px 0;">
                        <tr>
                          <td align="center" style="padding: 0;">
                            <a href="${signUpUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);">
                              Join ${APP_NAME} Now
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Fallback URL (in case link doesn't work) -->
                      <p style="margin: 0 0 32px 0; color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center; word-break: break-all;">
                        Or copy and paste this link in your browser:<br>
                        <a href="${signUpUrl}" style="color: #14b8a6; text-decoration: underline;">${signUpUrl}</a>
                      </p>
                      
                      <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
                        If you're already a member, you can view this promise in your dashboard.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 30px; background-color: #f5f7f8; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
                        This email was sent to ${mentorEmail}.<br>
                        If you didn't expect this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `
${APP_NAME}
Keep your word. Build trust.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mentorship Invitation

${promiserName} has invited you to be a mentor for their promise:

${promiseTitle}
${promiseDescription ? `\n${promiseDescription}\n` : ''}

As a mentor, you'll be able to:
• View the promise and its progress
• Add notes and encouragement
• Help ${promiserName} stay accountable

Join ${APP_NAME} to accept this mentorship invitation!

Sign up here: ${signUpUrl}

If you're already a member, you can view this promise in your dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This email was sent to ${mentorEmail}.
If you didn't expect this email, you can safely ignore it.
    `;

    await this.sendEmail(
      mentorEmail,
      `${promiserName} invited you to mentor their promise: ${promiseTitle}`,
      html,
      text
    );
  }
}
