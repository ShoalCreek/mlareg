import RegistrationForm from '@/components/RegistrationForm'

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
