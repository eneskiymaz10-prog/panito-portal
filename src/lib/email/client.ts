import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM =
  process.env.EMAIL_FROM || "Panito <orders@panito.com>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error("[Email] Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data ?? undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown email error";
    console.error("[Email] Unexpected error:", message);
    return { success: false, error: message };
  }
}

export { resend };
