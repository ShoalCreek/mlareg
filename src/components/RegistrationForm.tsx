"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { countries } from "@/lib/countries";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  passportName: string;
  email: string;
  whatsappNumber: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  country: string;
  organization: string;
  roommatePreference: string;
  passportPhoto: File | null;
  passportPhotoPath: string;
}

const initialForm: FormData = {
  passportName: "",
  email: "",
  whatsappNumber: "",
  gender: "",
  dateOfBirth: "",
  nationality: "",
  country: "",
  organization: "",
  roommatePreference: "",
  passportPhoto: null,
  passportPhotoPath: "",
};

export default function RegistrationForm() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!form.passportName.trim()) errs.passportName = "Name on passport is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.whatsappNumber.trim()) errs.whatsappNumber = "WhatsApp number is required";
    if (!form.gender) errs.gender = "Please select gender";
    if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    if (!form.nationality.trim()) errs.nationality = "Nationality is required";
    if (!form.country) errs.country = "Country is required";
    if (!form.organization.trim()) errs.organization = "Organization is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep3(): boolean {
    const errs: Record<string, string> = {};
    if (!form.passportPhotoPath && !form.passportPhoto) {
      errs.passportPhoto = "Passport photo page is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, passportPhoto: file }));
    setErrors((prev) => ({ ...prev, passportPhoto: "" }));

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new window.FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, passportPhotoPath: data.path }));
      } else {
        setErrors((prev) => ({ ...prev, passportPhoto: data.error }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, passportPhoto: "Upload failed. Please try again." }));
    } finally {
      setUploading(false);
    }
  }

  function nextStep() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  }

  function prevStep() {
    if (step > 1) setStep((step - 1) as Step);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passportName: form.passportName,
          email: form.email,
          whatsappNumber: form.whatsappNumber,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          nationality: form.nationality,
          country: form.country,
          organization: form.organization,
          roommatePreference: form.roommatePreference || null,
          passportPhotoPath: form.passportPhotoPath || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const checkoutRes = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: data.id }),
      });

      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      }
    } catch (error) {
      console.error("Submit error:", error);
      setErrors({ submit: "Registration failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const stepLabels = ["Personal Info", "Details", "Passport", "Review"];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i + 1 <= step
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs mt-1 text-gray-600 hidden sm:block">{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-colors ${
                  i + 1 < step ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name (as on passport) *
              </label>
              <input
                type="text"
                value={form.passportName}
                onChange={(e) => update("passportName", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="Enter your full name as it appears on your passport"
              />
              {errors.passportName && <p className="text-red-500 text-sm mt-1">{errors.passportName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                value={form.whatsappNumber}
                onChange={(e) => update("whatsappNumber", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="+1 234 567 8900"
              />
              {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Country, Nationality, Organization */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Additional Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality *
              </label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => update("nationality", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="e.g. American, Nigerian, Brazilian"
              />
              {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country of Residence *
              </label>
              <select
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization / Church *
              </label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => update("organization", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="Your church or organization name"
              />
              {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roommate Preference (optional)
              </label>
              <input
                type="text"
                value={form.roommatePreference}
                onChange={(e) => update("roommatePreference", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="Name of preferred roommate, if any"
              />
            </div>
          </div>
        )}

        {/* Step 3: Passport Photo */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Passport Photo Page</h2>
            <p className="text-gray-600 text-sm">
              Please upload a clear photo or scan of your passport information page.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {photoPreview ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Passport preview"
                    className="max-h-64 mx-auto rounded-lg shadow"
                  />
                  <p className="text-green-600 text-sm font-medium">
                    {uploading ? "Uploading..." : "Photo uploaded successfully"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview("");
                      setForm((prev) => ({ ...prev, passportPhoto: null, passportPhotoPath: "" }));
                    }}
                    className="text-red-500 text-sm underline"
                  >
                    Remove and upload different photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="space-y-2">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-600">
                      <span className="text-indigo-600 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-gray-400 text-xs">JPEG, PNG, WebP, or PDF (max 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {errors.passportPhoto && <p className="text-red-500 text-sm">{errors.passportPhoto}</p>}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Review Your Registration</h2>
            <p className="text-gray-600 text-sm">
              Please review your information before proceeding to payment.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Detail label="Name (Passport)" value={form.passportName} />
                <Detail label="Email" value={form.email} />
                <Detail label="WhatsApp" value={form.whatsappNumber} />
                <Detail label="Gender" value={form.gender === "male" ? "Male" : "Female"} />
                <Detail label="Date of Birth" value={form.dateOfBirth} />
                <Detail label="Nationality" value={form.nationality} />
                <Detail label="Country" value={form.country} />
                <Detail label="Organization" value={form.organization} />
                {form.roommatePreference && (
                  <Detail label="Roommate Pref." value={form.roommatePreference} />
                )}
              </div>
              {photoPreview && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Passport Photo</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Passport" className="max-h-32 rounded" />
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing..." : "Register & Pay"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
