type ContactNotification = {
  name: string;
  email: string;
  content: string;
  source?: string | null;
};

function configured() {
  return Boolean(process.env.EMAIL_SERVER && process.env.EMAIL_FROM);
}

export async function sendContactNotification(message: ContactNotification) {
  if (!configured()) {
    return { skipped: true, reason: "EMAIL_SERVER or EMAIL_FROM is not configured" };
  }

  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport(process.env.EMAIL_SERVER as string);
  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    replyTo: message.email,
    subject: `yaokai.me 新留言：${message.name}`,
    text: [
      `姓名：${message.name}`,
      `邮箱：${message.email}`,
      `来源：${message.source || "contact"}`,
      "",
      message.content
    ].join("\n")
  });

  return { skipped: false };
}
