#!/usr/bin/env python3
"""Creates all missing MLA Registration app files."""
import os

BASE = os.path.expanduser("~/mlareg")

def write_file(rel_path, content):
    full = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)
    print(f"  Created {rel_path}")

print("Creating MLA Registration app files...\n")

# .gitignore
write_file(".gitignore", """node_modules
.env*
*.db
/src/generated/prisma
/public/uploads/*
!/public/uploads/.gitkeep
.vercel
.next
""")

# .env
write_file(".env", """DATABASE_URL="postgresql://postgres:hYmyZYgzLUeHN6jf@db.vpqclvzcyfvmrfyladct.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:hYmyZYgzLUeHN6jf@db.vpqclvzcyfvmrfyladct.supabase.co:5432/postgres"

SUPABASE_URL="https://vpqclvzcyfvmrfyladct.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key-here"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
""")

# next.config.ts
write_file("next.config.ts", """import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default nextConfig
""")

# tsconfig.json
write_file("tsconfig.json", """{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""")

# postcss.config.mjs
write_file("postcss.config.mjs", """/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
""")

# eslint.config.mjs
write_file("eslint.config.mjs", """import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript")]

export default eslintConfig
""")

# prisma/schema.prisma (PostgreSQL for Supabase)
write_file("prisma/schema.prisma", """generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Registration {
  id                  String   @id @default(cuid())
  passportName        String
  email               String
  whatsappNumber      String
  gender              String
  dateOfBirth         String
  nationality         String
  country             String
  organization        String
  roommatePreference  String?
  passportPhotoPath   String?
  flightArrival       String?
  flightDeparture     String?
  paymentStatus       String   @default("pending")
  stripeSessionId     String?
  confirmationSent    Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
""")

# public/manifest.json
write_file("public/manifest.json", """{
  "name": "MLA Registration",
  "short_name": "MLA Reg",
  "description": "Movement Leading Academy Registration",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#1e3a5f",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
""")

# public/sw.js
write_file("public/sw.js", """const CACHE_NAME = 'mla-reg-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
""")

# src/app/globals.css
write_file("src/app/globals.css", """@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}
""")

# src/app/layout.tsx
write_file("src/app/layout.tsx", """import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MLA Registration',
  description: 'Movement Leading Academy Registration',
  manifest: '/manifest.json',
  themeColor: '#1e3a5f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
""")

# src/app/page.tsx
write_file("src/app/page.tsx", """import { RegistrationForm } from '@/components/RegistrationForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Movement Leading Academy</h1>
          <p className="text-slate-600 mt-2">Registration Form</p>
        </div>
        <RegistrationForm />
      </div>
    </main>
  )
}
""")

# src/components/ServiceWorkerRegistration.tsx
write_file("src/components/ServiceWorkerRegistration.tsx", """'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
""")

# src/lib/prisma.ts (Supabase/PostgreSQL version)
write_file("src/lib/prisma.ts", """import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
""")

# src/lib/supabase.ts
write_file("src/lib/supabase.ts", """import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
""")

# src/lib/countries.ts
write_file("src/lib/countries.ts", """export const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
  "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
  "Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic",
  "Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba",
  "Cyprus","Czech Republic","Democratic Republic of the Congo","Denmark","Djibouti",
  "Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea",
  "Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia",
  "Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan",
  "Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho",
  "Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
  "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand",
  "Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman",
  "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa",
  "San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname",
  "Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
  "Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan",
  "Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen",
  "Zambia","Zimbabwe"
]
""")

# src/lib/email.ts
write_file("src/lib/email.ts", """import nodemailer from 'nodemailer'

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
""")

# src/app/api/register/route.ts
write_file("src/app/api/register/route.ts", """import { NextRequest, NextResponse } from 'next/server'
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
""")

# src/app/api/upload/route.ts (Supabase Storage version)
write_file("src/app/api/upload/route.ts", """import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'bin'
    const fileName = `${uuidv4()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('passports')
      .upload(fileName, buffer, { contentType: file.type })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('passports')
      .getPublicUrl(fileName)

    return NextResponse.json({ path: urlData.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
""")

# src/app/api/create-checkout/route.ts
write_file("src/app/api/create-checkout/route.ts", """import { NextRequest, NextResponse } from 'next/server'

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
""")

# src/app/api/webhook/route.ts
write_file("src/app/api/webhook/route.ts", """import { NextRequest, NextResponse } from 'next/server'
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
""")

# src/app/confirmation/page.tsx
write_file("src/app/confirmation/page.tsx", """'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

interface Registration {
  id: string
  passportName: string
  email: string
  whatsappNumber: string
  gender: string
  dateOfBirth: string
  nationality: string
  country: string
  organization: string
  roommatePreference?: string
  passportPhotoPath?: string
  flightArrival?: string
  flightDeparture?: string
  paymentStatus: string
  confirmationSent: boolean
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [flightArrival, setFlightArrival] = useState('')
  const [flightDeparture, setFlightDeparture] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/register?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRegistration(data)
        if (data.flightArrival) setFlightArrival(data.flightArrival)
        if (data.flightDeparture) setFlightDeparture(data.flightDeparture)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const saveFlightDetails = async () => {
    if (!id || !flightArrival || !flightDeparture) return
    setSaving(true)
    try {
      await fetch('/api/register', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, flightArrival, flightDeparture }),
      })
      setSaved(true)
    } catch {
      alert('Failed to save flight details')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading...</div>
  }

  if (!registration) {
    return <div className="text-center py-20 text-red-500">Registration not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">&#10003;</div>
          <h1 className="text-2xl font-bold text-slate-800">Registration Confirmed!</h1>
          <p className="text-slate-600 mt-1">Thank you, {registration.passportName}</p>
        </div>

        <div className="border-t pt-6 space-y-3">
          <h2 className="font-semibold text-lg text-slate-700">Your Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Email:</span> {registration.email}</div>
            <div><span className="text-slate-500">WhatsApp:</span> {registration.whatsappNumber}</div>
            <div><span className="text-slate-500">Gender:</span> {registration.gender}</div>
            <div><span className="text-slate-500">DOB:</span> {registration.dateOfBirth}</div>
            <div><span className="text-slate-500">Nationality:</span> {registration.nationality}</div>
            <div><span className="text-slate-500">Country:</span> {registration.country}</div>
            <div className="col-span-2"><span className="text-slate-500">Organization:</span> {registration.organization}</div>
            {registration.roommatePreference && (
              <div className="col-span-2"><span className="text-slate-500">Roommate:</span> {registration.roommatePreference}</div>
            )}
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="font-semibold text-lg text-slate-700 mb-4">Flight Details</h2>
          {saved ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
              Flight details saved successfully!
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Date & Time</label>
                <input
                  type="datetime-local"
                  value={flightArrival}
                  onChange={(e) => setFlightArrival(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date & Time</label>
                <input
                  type="datetime-local"
                  value={flightDeparture}
                  onChange={(e) => setFlightDeparture(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={saveFlightDetails}
                disabled={saving || !flightArrival || !flightDeparture}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Flight Details'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
""")

print("\nAll files created successfully!")
print("\nNext steps:")
print("  1. cd ~/mlareg")
print("  2. npm install")
print("  3. npx prisma generate")
print("  4. npx prisma migrate dev --name init")
print("  5. git add -A && git commit -m 'Add all source files' && git push origin main")
