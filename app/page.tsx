// app/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <>
      {/* Global keyframes for subtle entrance animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeInUp 0.7s ease-out forwards;
        }
        .delay-1 { animation-delay: 0.2s; opacity: 0; }
        .delay-2 { animation-delay: 0.4s; opacity: 0; }
        .delay-3 { animation-delay: 0.6s; opacity: 0; }
        .delay-4 { animation-delay: 0.8s; opacity: 0; }
      `}</style>

      <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
        {/* ---------- HERO ---------- */}
        <section className="relative w-full px-6 pt-32 pb-24 sm:pt-40 sm:pb-32">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-zinc-100 opacity-40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-zinc-200 opacity-30 blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center space-y-10">
            <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl animate-fade-in">
              Next-Gen <br className="hidden sm:block" /> Attendance System
            </h1>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto animate-fade-in delay-1">
              Secure, automated, and seamless. Manage university attendance using QR technology
              and facial verification.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in delay-2">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-black text-white hover:bg-zinc-800">
                  Get Started
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-black text-black hover:bg-zinc-100"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- FEATURES ---------- */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-zinc-200">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why choose our platform?
            </h2>
            <p className="text-zinc-600 max-w-xl mx-auto">
              Designed for modern institutions that value security, speed, and simplicity.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group flex flex-col items-center text-center space-y-4 animate-fade-in ${
                  index === 0 ? "delay-1" : index === 1 ? "delay-2" : "delay-3"
                }`}
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-zinc-100 group-hover:bg-black transition-colors duration-300">
                  <span className="text-zinc-900 group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-zinc-600 max-w-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="w-full bg-zinc-50 px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4 animate-fade-in">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple 3‑step setup
              </h2>
              <p className="text-zinc-600 max-w-xl mx-auto">
                Start recording attendance in minutes — no hardware required.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`relative flex flex-col items-center text-center space-y-3 animate-fade-in ${
                    idx === 0 ? "delay-1" : idx === 1 ? "delay-2" : "delay-3"
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-zinc-600 max-w-xs">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- TRUST / STATS ---------- */}
        <section className="w-full max-w-6xl mx-auto px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-3 text-center animate-fade-in">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-4xl font-extrabold">{stat.value}</p>
                <p className="text-zinc-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- BOTTOM CTA ---------- */}
        <section className="w-full border-t border-zinc-200 px-6 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to modernize attendance?
            </h2>
            <p className="text-zinc-600">
              Join hundreds of forward‑thinking universities already using our platform.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-black text-white hover:bg-zinc-800">
                Create free account
              </Button>
            </Link>
          </div>
        </section>

        {/* ---------- FOOTER ---------- */}
        <footer className="w-full border-t border-zinc-200 px-6 py-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <p>© {new Date().getFullYear()} Attendance Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-black transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-black transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-black transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

// ---------- DATA (inline SVGs as icons) ----------
const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
        <path d="M3 9h18" />
        <path d="M15 3v18" />
        <path d="M3 15h18" />
      </svg>
    ),
    title: "Dynamic QR Codes",
    description: "Unique, time‑based QR codes that expire after use — preventing proxy attendance.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    title: "Face Verification",
    description: "Biometric liveness detection ensures the right student is present.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <path d="M12 14h.01" />
        <path d="M8 14h.01" />
        <path d="M16 14h.01" />
        <path d="M2 17l2 2 2-2" />
      </svg>
    ),
    title: "Real‑time Dashboard",
    description: "Instant reports and alerts for educators and administrators.",
  },
]

const steps = [
  {
    title: "Create a Session",
    description: "The lecturer opens a session and a QR code is displayed.",
  },
  {
    title: "Student Scans & Verifies",
    description: "Students scan the QR, complete a quick face check, and are marked present.",
  },
  {
    title: "View Analytics",
    description: "Attendance is recorded instantly with full audit trails.",
  },
]

const stats = [
  { value: "50+", label: "Universities" },
  { value: "500k+", label: "Attendance records processed" },
  { value: "99.9%", label: "Uptime guarantee" },
]