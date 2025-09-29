import nodemailer from 'nodemailer';

interface ReadingEmailDetails {
  category: string;
  topic: string;
  description: string;
  scheduledDate?: Date;
  duration: number;
  clientName?: string;
  readerName?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
};

export const emailTemplates = {
  welcomeEmail: (name: string) => ({
    subject: 'Welcome to Auralumic',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining Auralumic. We're excited to have you with us.</p>
    `,
  }),
  readingRequest: (readingDetails: ReadingEmailDetails) => ({
    subject: 'New Reading Request',
    html: `
      <h1>New Reading Request</h1>
      <p>You have received a new reading request.</p>
      <p>Category: ${readingDetails.category}</p>
      <p>Topic: ${readingDetails.topic}</p>
      <p>Duration: ${readingDetails.duration} minutes</p>
      ${readingDetails.scheduledDate ? `<p>Scheduled for: ${readingDetails.scheduledDate.toLocaleString()}</p>` : ''}
      <p>Description: ${readingDetails.description}</p>
    `,
  }),
  readingComplete: (readingDetails: ReadingEmailDetails) => ({
    subject: 'Reading Complete',
    html: `
      <h1>Your Reading is Complete</h1>
      <p>Your reading has been completed.</p>
      <p>Topic: ${readingDetails.topic}</p>
      ${readingDetails.clientName ? `<p>Client: ${readingDetails.clientName}</p>` : ''}
      ${readingDetails.readerName ? `<p>Reader: ${readingDetails.readerName}</p>` : ''}
      <p>Please log in to view the full details.</p>
    `,
  }),
};
