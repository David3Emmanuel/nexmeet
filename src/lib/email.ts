import { createTransport, SendMailOptions } from 'nodemailer'

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  const mailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  }
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent: ' + info.response)
  } catch (error) {
    console.error('Error sending email: ', error)
  }
}
