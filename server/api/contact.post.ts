// apps/api/server/api/contact.post.ts
import { z } from "zod";
import { sendEmailViaAPI } from "../utils/email";

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, email, subject, message } = ContactSchema.parse(body);

    const config = useRuntimeConfig();

    // Create transporter (if SMTP is configured)
    if (config.resendKey) {
      const html = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `;

      await sendEmailViaAPI(email, html, subject);
    }

    return {
      success: true,
      message: "Message sent successfully",
    };
  } catch (error) {
    console.error("Contact form error:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid form data",
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send message",
    });
  }
});
