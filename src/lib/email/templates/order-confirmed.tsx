interface OrderConfirmedProps {
  orderNumber: string;
  customerName: string;
}

export function orderConfirmedEmail({
  orderNumber,
  customerName,
}: OrderConfirmedProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                Panito
              </h1>
            </td>
          </tr>

          <!-- Icon -->
          <tr>
            <td align="center" style="padding: 40px 40px 0;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background-color: #e8f5e9; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; line-height: 64px;">
                &#10003;
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 40px 40px;">
              <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 22px; font-weight: 600; text-align: center;">
                Order Confirmed
              </h2>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; line-height: 1.6; text-align: center;">
                Hi ${customerName}, your order has been confirmed and is being processed.
              </p>

              <!-- Order Details Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px;">
                          Order Number
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #1a1a2e; font-size: 18px; font-weight: 600;">
                          ${orderNumber}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px;">
                          Status
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="display: inline-block; padding: 4px 12px; background-color: #dcfce7; color: #166534; font-size: 13px; font-weight: 500; border-radius: 9999px;">
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Our production team will begin working on your order shortly.
                You will receive further updates as your order progresses.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                This email was sent by Panito. If you have any questions,
                please contact our support team.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Panito. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
