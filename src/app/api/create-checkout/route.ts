import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { registrationId } = await request.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        url: `${appUrl}/confirmation?id=${registrationId}&status=skipped`,
      })
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'MLA Registration Fee' },
            unit_amount: 10000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/confirmation?id=${registrationId}&status=success`,
      cancel_url: `${appUrl}/confirmation?id=${registrationId}&status=cancelled`,
      metadata: { registrationId },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
