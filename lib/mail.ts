/**
 * Resend, only when both keys exist. A missing key or a failed send
 * is logged and ignored so the page still works.
 */
export async function sendEmail(message: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from || !message.to) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    });
    if (!response.ok) {
      console.error("Resend refused a message", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend was not reachable", error);
    return false;
  }
}
