import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Prisma } from '@prisma/client';
import { escapeHtml } from '../common/utils/escape-html.util';
import { toNumber } from '../common/utils/decimal.util';

/** Order shape for confirmation email (matches order-complete page invoice) */
export type OrderForEmail = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: { include: { defaultVariant: true } };
        variant: { include: { options: true } };
      };
    };
    coupons: true;
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

  /**
   * Build invoice HTML matching order-complete page (OrderSummaryCard).
   * Uses toNumber for Prisma Decimal handling.
   */
  private getOrderConfirmationTemplate(order: OrderForEmail) {
    const subtotalNum = toNumber(order.subtotal);
    const shippingNum = toNumber(order.shipping);
    const totalNum = toNumber(order.total);
    const storedDiscount = toNumber(order.discount);
    const coupons = order.coupons ?? [];
    const couponCode = coupons[0]?.code ?? null;

    // Same logic as OrderSummaryCard: ensure discount is visible
    const displayDiscount =
      storedDiscount > 0
        ? storedDiscount
        : Math.max(0, subtotalNum + shippingNum - totalNum);
    const hasDiscount = displayDiscount > 0.001;

    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const viewOrderUrl = `${baseUrl.replace(/\/$/, '')}/order-complete/${order.id}`;

    const itemsHtml = (order.items ?? [])
      .map((item: (typeof order.items)[number]) => {
        const lineTotal = toNumber(item.total);
        const productName = escapeHtml(item.product?.name ?? item.title ?? 'Item');
        const variantOpts = (item.variant?.options ?? []) as Array<{
          name?: string;
          value?: string;
        }>;
        const optionsHtml =
          variantOpts.length > 0
            ? variantOpts
                .map(
                  (o) =>
                    `<span style="display:inline-block;background:#f1f5f9;color:#475569;font-size:11px;padding:2px 6px;border-radius:4px;margin-right:4px;">${escapeHtml(String(o.value ?? ''))}</span>`,
                )
                .join('')
            : '';
        const imgSrc =
          item.variant?.image ||
          (item.variant?.images as string[])?.[0] ||
          (item.product?.defaultVariant as { image?: string; images?: string[] })
            ?.image ||
          (item.product?.defaultVariant as { images?: string[] })?.images?.[0];
        const imgHtml = imgSrc
          ? `<img src="${imgSrc.startsWith('http') ? imgSrc : baseUrl + imgSrc}" alt="" width="48" height="48" style="border-radius:6px;object-fit:cover;vertical-align:middle;" />`
          : '';

        return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="48" style="vertical-align:top;padding-right:12px;">${imgHtml}</td>
              <td>
                <div style="font-weight:600;color:#1e293b;">${productName}</div>
                ${optionsHtml ? `<div style="margin-top:4px;">${optionsHtml}</div>` : ''}
                <div style="font-size:13px;color:#64748b;margin-top:4px;">Qty: ${item.quantity}</div>
              </td>
              <td align="right" style="font-weight:600;color:#1e293b;">$${lineTotal.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>`;
      })
      .join('');

    const discountHtml = hasDiscount
      ? `
      <tr>
        <td colspan="2" style="padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-top:8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-weight:600;color:#15803d;font-size:14px;">Discount amount</td>
              <td align="right" style="font-weight:700;color:#15803d;font-size:14px;">-$${displayDiscount.toFixed(2)}</td>
            </tr>
            ${couponCode ? `
            <tr><td colspan="2" style="height:8px;"></td></tr>
            <tr>
              <td style="font-size:13px;color:#64748b;">Code used</td>
              <td align="right" style="font-family:monospace;font-weight:700;font-size:13px;letter-spacing:0.05em;color:#1e293b;">${escapeHtml(couponCode)}</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
      `
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f7fafc;color:#2d3748;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f7fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#e53e3e;letter-spacing:-0.025em;text-transform:uppercase;">ShopHub</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1a202c;">Thank you for your order!</h2>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4a5568;">
                Hi ${escapeHtml(order.user?.firstName || (order.shippingAddress as Record<string, string>)?.firstName || 'there')}, we've received your order and we're getting it ready for you. We'll notify you when it ships.
              </p>
              <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;">
                <div style="font-size:14px;color:#718096;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Order Number</div>
                <div style="font-size:18px;font-weight:700;color:#1a202c;">${escapeHtml(String(order.orderNumber ?? order.id ?? ''))}</div>
              </div>

              <div style="border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">
                <span style="font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Your order</span>
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                ${itemsHtml}
              </table>

              <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#64748b;">Subtotal</td>
                    <td align="right" style="padding:8px 0;font-size:14px;font-weight:500;color:#1e293b;">$${subtotalNum.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#64748b;">${shippingNum > 0 ? 'Shipping' : 'Shipping (Free)'}</td>
                    <td align="right" style="padding:8px 0;font-size:14px;font-weight:500;color:#1e293b;">${shippingNum > 0 ? `$${shippingNum.toFixed(2)}` : 'Free'}</td>
                  </tr>
                  ${discountHtml}
                  <tr>
                    <td style="padding:16px 0 8px;font-weight:600;color:#1e293b;border-top:1px solid #e2e8f0;">Total</td>
                    <td align="right" style="padding:16px 0 8px;font-weight:700;font-size:18px;color:#1e293b;border-top:1px solid #e2e8f0;">$${totalNum.toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align:center;margin-top:32px;">
                <a href="${escapeHtml(viewOrderUrl)}" style="display:inline-block;background:#e53e3e;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">View Order Status</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;background:#f8fafc;text-align:center;border-top:1px solid #edf2f7;">
              <p style="margin:0;font-size:14px;color:#718096;">Questions? Reply to this email or contact our support team.</p>
              <p style="margin:8px 0 0;font-size:12px;color:#a0aec0;">&copy; ${new Date().getFullYear()} ShopHub. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
