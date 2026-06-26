import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendConfirmationEmail(registration: {
  passportName: string
  email: string
  id: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: registration.email,
    subject: 'MLA Registration Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">Registration Confirmed!</h1>
        <p>Dear ${registration.passportName},</p>
        <p>Thank you for registering for the Movement Leading Academy.</p>
        <p>Please add your flight details when available:</p>
        <p><a href="${appUrl}/confirmation?id=${registration.id}" style="background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Registration & Add Flight Details</a></p>
        <p>We look forward to seeing you!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">Movement Leading Academy</p>
      </div>
    `,
  })
}

export async function sendFlightDetailsEmail(registration: {
  passportName: string
  email: string
  flightArrival: string
  flightDeparture: string
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: registration.email,
    subject: 'MLA - Flight Details Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">Flight Details Received</h1>
        <p>Dear ${registration.passportName},</p>
        <p>We have received your flight details:</p>
        <ul>
          <li><strong>Arrival:</strong> ${registration.flightArrival}</li>
          <li><strong>Departure:</strong> ${registration.flightDeparture}</li>
        </ul>
        <p>Thank you!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">Movement Leading Academy</p>
      </div>
    `,
  })
}
