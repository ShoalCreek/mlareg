'use client'

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
