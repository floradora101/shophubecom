import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Prisma } from '@prisma/client';
import { escapeHtml } from '../common/utils/escape-html.util';

/** Order shape for confirmation email (from checkout with items + product, user) */
export type OrderForEmail = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    user: true;
  };
}>;

@Injectable()
export class EmailService {
  private transporter?: ReturnType<typeof nodemailer.createTransport>;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && port && user && pass) {
      const tlsRejectUnauthorized = this.configService.get<string>('SMTP_INSECURE') !== 'true';
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: tlsRejectUnauthorized,
        },
      });
    } else {
      this.logger.warn(
        'SMTP configuration is missing. Emails will be logged to console instead.',
      );
    }
  }

  async sendOrderConfirmation(to: string, orderData: OrderForEmail) {
    const subject = `Order Confirmation - ${orderData.orderNumber || orderData.id}`;
    const html = this.getOrderConfirmationTemplate(orderData);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get<string>('EMAIL_FROM') || '"ShopHub" <noreply@shophub.com>',
          to,
          subject,
          html,
        });
        this.logger.log(`Order confirmation email sent to ${to}`);
      } catch (error) {
        this.logger.error(`Failed to send email to ${to}`, (error as Error).stack);
      }
    } else {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      // In a real senior implementation, we might use a service like Ethereal for dev
      // but for now, logging the HTML is enough to show it works.
    }
  }

  /**
   * Send password reset email with link containing the one-time token.
   * Token format: `${tokenId}:${rawToken}` (same as stored in DB).
   */
  async sendPasswordReset(to: string, resetToken: string, firstName?: string): Promise<void> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const subject = 'Reset your ShopHub password';
    const html = this.getPasswordResetTemplate(resetUrl, firstName);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get<string>('EMAIL_FROM') || '"ShopHub" <noreply@shophub.com>',
          to,
          subject,
          html,
        });
        this.logger.log(`Password reset email sent to ${to}`);
      } catch (error) {
        this.logger.error(`Failed to send password reset email to ${to}`, (error as Error).stack);
      }
    } else {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Link: ${resetUrl}`);
    }
  }

  private getPasswordResetTemplate(resetUrl: string, firstName?: string): string {
    const name = firstName ? escapeHtml(firstName) : 'there';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; color: #2d3748;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px;" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #e53e3e; letter-spacing: -0.025em; text-transform: uppercase;">ShopHub</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1a202c;">Reset your password</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                Hi ${name}, we received a request to reset your password. Click the button below to choose a new password. This link expires in 15 minutes.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #718096;">
                If you didn't request this, you can safely ignore this email.
              </p>
              <div style="text-align: center; margin-top: 32px;">
                <a href="${escapeHtml(resetUrl)}" style="display: inline-block; background-color: #e53e3e; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Reset password</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                &copy; ${new Date().getFullYear()} ShopHub. All rights reserved.
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
  }

  private getOrderConfirmationTemplate(order: OrderForEmail) {
    const totalNum = Number(order.total ?? 0);
    const itemsHtml = (order.items ?? [])
      .map(
        (item: (typeof order.items)[number]) => {
          const unitPrice = Number(item.unitPrice ?? 0);
          const qty = item.quantity ?? 0;
          const lineTotal = unitPrice * qty;
          const productName = escapeHtml(item.product?.name ?? item.title ?? 'Item');
          return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #edf2f7;">
          <div style="font-weight: 600; color: #1a202c;">${productName}</div>
          <div style="font-size: 14px; color: #718096;">Qty: ${qty}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #edf2f7; text-align: right; vertical-align: top; color: #1a202c;">
          $${lineTotal.toFixed(2)}
        </td>
      </tr>
    `;
        },
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; color: #2d3748;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600px" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #e53e3e; letter-spacing: -0.025em; text-transform: uppercase;">ShopHub</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1a202c;">Thank you for your order!</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                Hi ${escapeHtml(order.user?.firstName || (order.shippingAddress as Record<string, string>)?.firstName || 'there')}, we've received your order and we're getting it ready for you. We'll notify you when it ships.
              </p>
              
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <div style="font-size: 14px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Order Number</div>
                <div style="font-size: 18px; font-weight: 700; color: #1a202c;">${escapeHtml(String(order.orderNumber ?? order.id ?? ''))}</div>
              </div>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th align="left" style="font-size: 14px; color: #718096; text-transform: uppercase; padding-bottom: 8px; border-bottom: 2px solid #edf2f7;">Item</th>
                    <th align="right" style="font-size: 14px; color: #718096; text-transform: uppercase; padding-bottom: 8px; border-bottom: 2px solid #edf2f7;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding: 20px 0 8px 0; font-weight: 600; color: #4a5568;">Subtotal</td>
                    <td align="right" style="padding: 20px 0 8px 0; font-weight: 600; color: #1a202c;">$${totalNum.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 18px; font-weight: 800; color: #1a202c; border-top: 2px solid #edf2f7; padding-top: 16px;">Total</td>
                    <td align="right" style="padding: 8px 0; font-size: 18px; font-weight: 800; color: #e53e3e; border-top: 2px solid #edf2f7; padding-top: 16px;">$${totalNum.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="text-align: center; margin-top: 40px;">
                <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/order-complete/${order.id}" style="display: inline-block; background-color: #e53e3e; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">View Order Status</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="margin: 0; font-size: 14px; color: #718096;">
                Questions? Reply to this email or contact our support team.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #a0aec0;">
                &copy; ${new Date().getFullYear()} ShopHub. All rights reserved.
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
  }
}
