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
    const signUpUrl = process.env.APP_URL 
      ? `${process.env.APP_URL}/signup?email=${encodeURIComponent(promiseeEmail)}&promise=${promiseId || ''}`
      : '#';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You Have a New Promise</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${APP_NAME}</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">You Have a New Promise!</h2>
            
            <p><strong>${promiserName}</strong> has made a promise to you:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">${promiseTitle}</h3>
              ${promiseDescription ? `<p style="color: #666;">${promiseDescription}</p>` : ''}
            </div>
            
            <p>Join ${APP_NAME} to view and track this promise, and help ${promiserName} stay accountable!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signUpUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; 
                        font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Join ${APP_NAME} Now
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you're already a member, you can view this promise in your dashboard.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This email was sent to ${promiseeEmail}. If you didn't expect this email, you can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
${APP_NAME}

You Have a New Promise!

${promiserName} has made a promise to you:

${promiseTitle}
${promiseDescription ? `\n${promiseDescription}\n` : ''}

Join ${APP_NAME} to view and track this promise, and help ${promiserName} stay accountable!

Sign up here: ${signUpUrl}

If you're already a member, you can view this promise in your dashboard.

---
This email was sent to ${promiseeEmail}. If you didn't expect this email, you can safely ignore it.
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
    const signUpUrl = process.env.APP_URL 
      ? `${process.env.APP_URL}/signup?email=${encodeURIComponent(mentorEmail)}&promise=${promiseId || ''}`
      : '#';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mentorship Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${APP_NAME}</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">Mentorship Invitation</h2>
            
            <p><strong>${promiserName}</strong> has invited you to be a mentor for their promise:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">${promiseTitle}</h3>
              ${promiseDescription ? `<p style="color: #666;">${promiseDescription}</p>` : ''}
            </div>
            
            <p>As a mentor, you'll be able to:</p>
            <ul style="color: #666;">
              <li>View the promise and its progress</li>
              <li>Add notes and encouragement</li>
              <li>Help ${promiserName} stay accountable</li>
            </ul>
            
            <p>Join ${APP_NAME} to accept this mentorship invitation!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signUpUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; 
                        font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Join ${APP_NAME} Now
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you're already a member, you can view this promise in your dashboard.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This email was sent to ${mentorEmail}. If you didn't expect this email, you can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
${APP_NAME}

Mentorship Invitation

${promiserName} has invited you to be a mentor for their promise:

${promiseTitle}
${promiseDescription ? `\n${promiseDescription}\n` : ''}

As a mentor, you'll be able to:
- View the promise and its progress
- Add notes and encouragement
- Help ${promiserName} stay accountable

Join ${APP_NAME} to accept this mentorship invitation!

Sign up here: ${signUpUrl}

If you're already a member, you can view this promise in your dashboard.

---
This email was sent to ${mentorEmail}. If you didn't expect this email, you can safely ignore it.
    `;

    await this.sendEmail(
      mentorEmail,
      `${promiserName} invited you to mentor their promise: ${promiseTitle}`,
      html,
      text
    );
  }
}
