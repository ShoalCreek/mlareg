import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const registration = await prisma.registration.create({
      data: {
        passportName: body.passportName,
        email: body.email,
        whatsappNumber: body.whatsappNumber,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth,
        nationality: body.nationality,
        country: body.country,
        organization: body.organization,
        roommatePreference: body.roommatePreference || null,
        passportPhotoPath: body.passportPhotoPath || null,
      },
    })

    try {
      await sendConfirmationEmail(registration)
      await prisma.registration.update({
        where: { id: registration.id },
        data: { confirmationSent: true },
      })
    } catch {
      console.error('Failed to send confirmation email')
    }

    return NextResponse.json({ id: registration.id })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  const registration = await prisma.registration.findUnique({ where: { id } })
  if (!registration) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(registration)
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, flightArrival, flightDeparture } = body

    const registration = await prisma.registration.update({
      where: { id },
      data: { flightArrival, flightDeparture },
    })

    return NextResponse.json(registration)
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
