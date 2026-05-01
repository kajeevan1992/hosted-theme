
import React, { useState } from "react";
import { Lock, Mail, UserRound, KeyRound, ChevronRight } from "lucide-react";

function Field({ icon, label, type = "text", placeholder = "" }) {
  const Icon = icon;
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "#667179" }}>{label}</span>
      <div className="flex h-10 items-center gap-3 rounded-[12px] border bg-white px-3" style={{ borderColor: "#E2E6E8" }}>
        <Icon className="h-4 w-4" style={{ color: "#667179" }} />
        <input type={type} placeholder={placeholder} className="w-full border-0 bg-transparent p-0 text-[13px] outline-none" />
      </div>
    </label>
  );
}

export default function AuthPage({ navigate }) {
  const [mode, setMode] = useState("login");
  return (
    <section className="py-8">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[20px] border bg-white shadow-[0_14px_30px_rgba(0,0,0,0.04)] lg:grid-cols-[0.88fr_1.12fr]" style={{ borderColor: "#E2E6E8" }}>
          <div className="bg-[linear-gradient(180deg,#F7FAFB,#EFF4F6)] p-7">
            <div className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgb(24, 167, 208)" }}>
              Customer portal
            </div>
            <h1 className="mt-4 text-[36px] font-black leading-[0.96] tracking-[-0.045em]" style={{ color: "#121517" }}>
              Manage orders, artwork and account access.
            </h1>
            <p className="mt-3 max-w-[480px] text-[12px] leading-6" style={{ color: "#667179" }}>
              A denser customer sign-in area designed to feel more like a real print-order portal.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Recent orders", "Track current jobs"],
                ["Artwork handoff", "Upload now or later"],
                ["Reorders", "Repeat frequent jobs"],
                ["Support access", "Billing and help"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[14px] border bg-white p-3" style={{ borderColor: "#E2E6E8" }}>
                  <div className="text-[12px] font-bold" style={{ color: "#121517" }}>{title}</div>
                  <div className="mt-1 text-[11px] leading-5" style={{ color: "#667179" }}>{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                ["login", "Login"],
                ["register", "Register"],
                ["forgot", "Forgot password"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className="rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    borderColor: mode === key ? "rgb(24, 167, 208)" : "#E2E6E8",
                    backgroundColor: mode === key ? "#F1FAFD" : "white",
                    color: mode === key ? "#121517" : "#667179",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === "login" && (
              <div>
                <div className="text-[26px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>Welcome back</div>
                <p className="mt-1 text-[12px] leading-6" style={{ color: "#667179" }}>Sign in to access orders, artwork and account actions.</p>
                <div className="mt-5 grid gap-4">
                  <Field icon={Mail} label="Email address" type="email" placeholder="name@example.com" />
                  <Field icon={Lock} label="Password" type="password" placeholder="••••••••" />
                  <button onClick={() => navigate("/account")} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white">
                    Sign in
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {mode === "register" && (
              <div>
                <div className="text-[26px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>Create account</div>
                <p className="mt-1 text-[12px] leading-6" style={{ color: "#667179" }}>Set up a customer account for artwork, orders and repeat jobs.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field icon={UserRound} label="First name" placeholder="John" />
                  <Field icon={UserRound} label="Last name" placeholder="Doe" />
                  <div className="sm:col-span-2"><Field icon={Mail} label="Email address" type="email" placeholder="name@example.com" /></div>
                  <div className="sm:col-span-2"><Field icon={Lock} label="Password" type="password" placeholder="Create a password" /></div>
                  <div className="sm:col-span-2">
                    <button onClick={() => navigate("/account")} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white">
                      Create account
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === "forgot" && (
              <div>
                <div className="text-[26px] font-black tracking-[-0.04em]" style={{ color: "#121517" }}>Reset password</div>
                <p className="mt-1 text-[12px] leading-6" style={{ color: "#667179" }}>Enter your email and we’ll send reset instructions.</p>
                <div className="mt-5 grid gap-4">
                  <Field icon={KeyRound} label="Account email" type="email" placeholder="name@example.com" />
                  <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#121517] px-5 py-3 text-[12px] font-bold text-white">
                    Send reset link
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
