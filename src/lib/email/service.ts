// Email service - SendGrid ready
// In production, replace mock implementations with actual SendGrid API calls

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

// Email templates
const templates = {
  quoteConfirmation: (data: { firstName: string; productName: string; provider: string }) => ({
    subject: `Your Quote Request for ${data.productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #006fc5 0%, #0159a0 100%); padding: 30px; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">GlobalCover</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
          <h2 style="color: #111827; margin-top: 0;">Hi ${data.firstName}!</h2>
          <p>Thank you for your interest in <strong>${data.productName}</strong> by ${data.provider}.</p>
          <p>We've received your quote request and our team will review your information. You can expect to hear back from us within 24 hours with a personalized quote.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              <strong>What happens next?</strong><br>
              1. Our team reviews your information<br>
              2. We compare options from multiple providers<br>
              3. You receive a personalized quote via email
            </p>
          </div>
          <p>If you have any questions in the meantime, feel free to reply to this email.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The GlobalCover Team
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} GlobalCover. All rights reserved.</p>
          <p>
            <a href="#" style="color: #6b7280;">Privacy Policy</a> · 
            <a href="#" style="color: #6b7280;">Terms of Service</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${data.firstName}!\n\nThank you for your interest in ${data.productName} by ${data.provider}.\n\nWe've received your quote request and our team will review your information. You can expect to hear back from us within 24 hours with a personalized quote.\n\nBest regards,\nThe GlobalCover Team`,
  }),

  adminLeadNotification: (data: { 
    productName: string; 
    firstName: string; 
    lastName: string; 
    email: string; 
    country: string;
  }) => ({
    subject: `[New Lead] ${data.productName} - ${data.firstName} ${data.lastName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: system-ui, sans-serif; padding: 20px;">
        <h2 style="color: #111827;">New Quote Request</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Product:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.productName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Country:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.country}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="#" style="background: #006fc5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">View in Dashboard</a>
        </p>
      </body>
      </html>
    `,
    text: `New Quote Request\n\nProduct: ${data.productName}\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nCountry: ${data.country}`,
  }),

  waitlistConfirmation: (data: { firstName: string; position: number; referralCode: string }) => ({
    subject: `You're #${data.position} on the GlobalCover Waitlist!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 You're on the list!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
          <h2 style="color: #111827; margin-top: 0;">Hi ${data.firstName}!</h2>
          <p>You're <strong style="color: #006fc5; font-size: 24px;">#${data.position}</strong> on the GlobalCover waitlist.</p>
          <p>As a founding member, you'll get:</p>
          <ul style="padding-left: 20px;">
            <li>Up to <strong>40% off</strong> your first year</li>
            <li>Priority access to exclusive deals</li>
            <li>Early access to new features</li>
          </ul>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #fcd34d;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">🚀 Skip the line!</p>
            <p style="margin: 0; font-size: 14px; color: #78350f;">
              Share your unique referral code and move up 10 spots for each friend who joins:
            </p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
              <code style="font-size: 24px; font-weight: bold; color: #006fc5; letter-spacing: 2px;">${data.referralCode}</code>
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            The GlobalCover Team
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} GlobalCover. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${data.firstName}!\n\nYou're #${data.position} on the GlobalCover waitlist.\n\nShare your referral code to move up: ${data.referralCode}\n\nBest regards,\nThe GlobalCover Team`,
  }),

  referralSuccess: (data: { firstName: string; newPosition: number; referredName: string }) => ({
    subject: `🎉 You moved up! Now #${data.newPosition} on the waitlist`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚀 You moved up!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
          <h2 style="color: #111827; margin-top: 0;">Hi ${data.firstName}!</h2>
          <p><strong>${data.referredName}</strong> just joined using your referral code!</p>
          <p>You've moved up to position <strong style="color: #006fc5; font-size: 24px;">#${data.newPosition}</strong>.</p>
          <p>Keep sharing to move up even more! Each referral = 10 spots.</p>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${data.firstName}!\n\n${data.referredName} just joined using your referral code!\n\nYou've moved up to position #${data.newPosition}.\n\nBest regards,\nThe GlobalCover Team`,
  }),

  paymentConfirmation: (data: { firstName: string; planType: string; amount: number }) => ({
    subject: `Welcome to GlobalCover Membership!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #006fc5 0%, #0159a0 100%); padding: 30px; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to GlobalCover!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
          <h2 style="color: #111827; margin-top: 0;">Hi ${data.firstName}!</h2>
          <p>Thank you for joining GlobalCover Membership!</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Plan:</strong> ${data.planType}</p>
            <p style="margin: 10px 0 0 0;"><strong>Amount:</strong> $${(data.amount / 100).toFixed(2)}</p>
          </div>
          <p>You now have access to all member benefits. Log in to start exploring exclusive deals!</p>
          <p style="margin-top: 20px;">
            <a href="#" style="background: #006fc5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Access Your Benefits</a>
          </p>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${data.firstName}!\n\nThank you for joining GlobalCover Membership!\n\nPlan: ${data.planType}\nAmount: $${(data.amount / 100).toFixed(2)}\n\nYou now have access to all member benefits.\n\nBest regards,\nThe GlobalCover Team`,
  }),
};

class EmailService {
  private config: SendGridConfig | null = null;
  private initialized = false;

  initialize(config: SendGridConfig): void {
    this.config = config;
    this.initialized = true;
    console.log('[Email] Service initialized');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.initialized || !this.config) {
      console.log('[Email] Mock send:', options.subject, 'to', options.to);
      return { success: true, messageId: `mock_${Date.now()}` };
    }

    // In production, use SendGrid API:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.config.apiKey);
    // await sgMail.send({
    //   to: options.to,
    //   from: { email: this.config.fromEmail, name: this.config.fromName },
    //   replyTo: options.replyTo || this.config.replyTo,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });

    console.log('[Email] Would send:', options.subject, 'to', options.to);
    return { success: true, messageId: `sg_${Date.now()}` };
  }

  async sendQuoteConfirmation(to: string, data: { firstName: string; productName: string; provider: string }): Promise<{ success: boolean; error?: string }> {
    const template = templates.quoteConfirmation(data);
    return this.send({ to, ...template });
  }

  async sendAdminLeadNotification(data: { 
    productName: string; 
    firstName: string; 
    lastName: string; 
    email: string; 
    country: string;
  }): Promise<{ success: boolean; error?: string }> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@globalcover.com';
    const template = templates.adminLeadNotification(data);
    return this.send({ to: adminEmail, ...template });
  }

  async sendWaitlistConfirmation(to: string, data: { firstName: string; position: number; referralCode: string }): Promise<{ success: boolean; error?: string }> {
    const template = templates.waitlistConfirmation(data);
    return this.send({ to, ...template });
  }

  async sendReferralSuccess(to: string, data: { firstName: string; newPosition: number; referredName: string }): Promise<{ success: boolean; error?: string }> {
    const template = templates.referralSuccess(data);
    return this.send({ to, ...template });
  }

  async sendPaymentConfirmation(to: string, data: { firstName: string; planType: string; amount: number }): Promise<{ success: boolean; error?: string }> {
    const template = templates.paymentConfirmation(data);
    return this.send({ to, ...template });
  }

  // Generic admin notification for various events
  async sendAdminNotification(
    eventType: 'new_lead' | 'new_waitlist' | 'payment_completed' | 'payment_failed',
    data: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@globalcover.com';
    
    const subjects: Record<string, string> = {
      new_lead: `[New Lead] ${data.productName ?? 'Quote Request'}`,
      new_waitlist: `[Waitlist] New signup: ${data.email}`,
      payment_completed: `[Payment] Completed: ${data.email}`,
      payment_failed: `[Payment] Failed: ${data.email}`,
    };

    const subject = subjects[eventType] ?? `[Alert] ${eventType}`;
    const html = `
      <html>
      <body style="font-family: system-ui, sans-serif; padding: 20px;">
        <h2>${subject}</h2>
        <pre style="background: #f3f4f6; padding: 15px; border-radius: 8px; overflow: auto;">
${JSON.stringify(data, null, 2)}
        </pre>
      </body>
      </html>
    `;

    return this.send({ to: adminEmail, subject, html, text: JSON.stringify(data, null, 2) });
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Initialize with env vars
export function initializeEmailService(): void {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM ?? 'hello@globalcover.com';
  const fromName = process.env.EMAIL_FROM_NAME ?? 'GlobalCover';
  const replyTo = process.env.EMAIL_REPLY_TO ?? 'support@globalcover.com';

  if (apiKey) {
    emailService.initialize({ apiKey, fromEmail, fromName, replyTo });
  } else {
    console.log('[Email] Running in mock mode (no SENDGRID_API_KEY)');
  }
}
