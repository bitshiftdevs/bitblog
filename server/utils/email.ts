export async function sendEmailViaAPI(
  email: string,
  htmlContent: string,
  subject: string,
) {
  const config = useRuntimeConfig();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.resendKey}`,
    },
    body: JSON.stringify({
      from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
      to: "admins@bitshiftdevs.com", // Send to admin
      subject: `Contact Form: ${subject}`,

      replyTo: email,
      html: htmlContent,
    }),
  });

  const data = await response.json();
  console.log("Email sent via API:", data);
}
