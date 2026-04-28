"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, CheckCircle, Loader2 } from "lucide-react";

const VALID_EMAIL = "info@rapidsteno.com";
const VALID_PASSWORD = "Encore@54321";
const SECURITY_ANSWER = "aquib";

export default function LoginPage() {
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1=email+password, 2=security question, 3=success
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (email.trim().toLowerCase() !== VALID_EMAIL) {
      setError("Invalid email address");
      return;
    }
    if (password !== VALID_PASSWORD) {
      setError("Incorrect password");
      return;
    }

    setStep(2);
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    setError("");

    if (securityAnswer.trim().toLowerCase() !== SECURITY_ANSWER) {
      setError("Incorrect answer. Try again!");
      return;
    }

    // Show success popup
    setIsLoading(true);
    setStep(3);

    // Redirect after showing success
    setTimeout(() => {
      login();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="https://ik.imagekit.io/rapidsteno/469f2304-88c0-41aa-9c24-f064049e3015.jpg?updatedAt=1773021702704"
            alt="Rapid Steno"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Success Popup */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-brand" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Successful!</h2>
            <p className="text-gray-500 mb-6">Welcome back! Redirecting to dashboard...</p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          </div>
        )}

        {/* Step 1: Email & Password */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
              <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleCredentialSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="Enter your email"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter your password"
                    className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl shadow-lg shadow-brand/20 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Security Question */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-brand" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Security Check</h1>
              <p className="text-sm text-gray-500 mt-1">Answer the security question to continue</p>
            </div>

            <form onSubmit={handleSecuritySubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Who is the smartest person in Rapid Steno?
                </label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => { setSecurityAnswer(e.target.value); setError(""); }}
                  placeholder="Type your answer"
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl shadow-lg shadow-brand/20 hover:shadow-xl transition-all duration-300"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Rapid Steno &middot; Mock Generator v2.0
        </p>
      </div>
    </div>
  );
}
