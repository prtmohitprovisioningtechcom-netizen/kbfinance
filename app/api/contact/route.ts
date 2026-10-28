import { NextResponse } from 'next/server';
import pool, { withTimeout, ensureContactTable } from '@/lib/db';
import { dbErrorMessage } from '@/lib/auth-db';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, city, message, service, service_required } = body;

    if (!name || !phone || !city) {
      return NextResponse.json({ error: 'Missing required fields (Name, Mobile Number, and City are required)' }, { status: 400 });
    }

    const serviceVal = service_required || service || null;

    let dbSuccess = false;
    let insertId: number | null = null;
    let dbErrorDetails: string | null = null;

    // 1. Persist to MySQL database if available
    try {
      await withTimeout(ensureContactTable(), 6000);
      const query = `
        INSERT INTO contact_inquiries (name, phone, email, city, service_required, message)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [
        String(name).trim(),
        String(phone).trim(),
        email ? String(email).trim() : null,
        String(city).trim(),
        serviceVal ? String(serviceVal).trim() : null,
        message ? String(message).trim() : null,
      ];

      const [result] = await withTimeout(pool.execute(query, values), 6000);
      insertId = (result as any)?.insertId || null;
      dbSuccess = true;
    } catch (dbErr: any) {
      console.error('Contact DB insert error:', dbErr);
      dbErrorDetails = dbErrorMessage(dbErr);
    }

    // 2. Dispatch email notification via Nodemailer
    let emailSent = false;
    let emailErrorDetails: string | null = null;

    try {
      const smtpUser = process.env.SMTP_USER?.trim();
      const smtpPass = process.env.SMTP_PASS?.trim();

      if (smtpUser && smtpPass) {
        const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
        const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: smtpPort,
          secure: isSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const recipient = process.env.NOTIFICATION_EMAIL || 'FINANCESERVICESKB@GMAIL.COM';

        const mailOptions = {
          from: `KB Finance <${smtpUser}>`,
          to: recipient,
          subject: `New Enquiry from ${name} (${phone})`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #0A2540; color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 22px;">New Contact Enquiry Received</h2>
              </div>
              <div style="padding: 24px; background-color: #ffffff;">
                <p style="margin-top: 0;">You have received a new inquiry through the website:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 30%;">Name:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Phone:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><a href="tel:${phone}">${phone}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Email:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${email ? `<a href="mailto:${email}">${email}</a>` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">City:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${city}</td>
                  </tr>
                  ${serviceVal ? `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Service:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${serviceVal}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: bold; vertical-align: top;">Message:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${message ? String(message).replace(/\n/g, '<br>') : 'N/A'}</td>
                  </tr>
                </table>
              </div>
              <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
                Sent automatically by KB Finance website.
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } else {
        console.warn('SMTP credentials not configured, skipping email notification');
      }
    } catch (emailErr: any) {
      console.error('Failed to send email notification:', emailErr);
      emailErrorDetails = emailErr?.message || 'Failed to dispatch email';
    }

    // Success if saved in DB or forwarded via email
    if (dbSuccess || emailSent) {
      return NextResponse.json({
        success: true,
        id: insertId,
        emailSent,
        warning: !dbSuccess ? 'Inquiry received via email notification (Database temporarily unavailable).' : undefined,
      }, { status: 201 });
    }

    // If both failed
    const errorMsg = dbErrorDetails || emailErrorDetails || 'Failed to submit inquiry. Please try again later.';
    return NextResponse.json({
      error: errorMsg,
      details: {
        db: dbErrorDetails,
        email: emailErrorDetails,
      },
    }, { status: 500 });

  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
