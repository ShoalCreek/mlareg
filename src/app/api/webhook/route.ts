import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ received: true })
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const registrationId = session.metadata.registrationId

      await prisma.registration.update({
        where: { id: registrationId },
        data: {
          paymentStatus: 'paid',
          stripeSessionId: session.id,
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}
