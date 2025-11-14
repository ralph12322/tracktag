"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginContent() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'forgot-password' | 'reset-password'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (res.ok) {
        toast.success('Login successful!');
        window.dispatchEvent(new Event('user-updated'));

        // Redirect based on role
        if (data.role === 'Admin') {
          router.push('/auth/admin');
        } else {
          router.push('/');
        }
      } else {
        toast.error(`${data.error}`);
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setTempUserId(data.userId);
        setStep('reset-password');
        toast.success('OTP sent to your email!');
      } else {
        toast.error(`${data.error}`);
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      toast.error('Failed to send reset email. Please try again.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempUserId,
          otp,
          newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset successful! Please login.');
        setStep('credentials');
        setUsername('');
        setPassword('');
        setOtp('');
        setResetEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(`${data.error}`);
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error('Password reset failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempUserId,
          type: 'password-reset'
        }),
      });

      if (res.ok) {
        toast.success('OTP resent successfully!');
      } else {
        const data = await res.json();
        toast.error(`${data.error}`);
      }
    } catch (error) {
      console.error('Resend OTP failed:', error);
      toast.error('Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative flex items-center justify-center px-4">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-slate-700 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      </div>

      {/* Login Card */}
      <div className="relative max-w-md w-full group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

        <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-teal-500/30 shadow-2xl">
          {/* Header Dots */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse animation-delay-150"></span>
              <span className="w-3 h-3 rounded-full bg-slate-400 animate-pulse animation-delay-300"></span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              {step === 'credentials' && 'Login to TrackTag'}
              {step === 'forgot-password' && 'Forgot Password'}
              {step === 'reset-password' && 'Reset Password'}
            </h2>
            {step === 'credentials' && (
              <p className="text-slate-300 text-sm font-light">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-teal-400 hover:text-teal-300 transition-colors duration-300 underline decoration-teal-400/30 hover:decoration-teal-300"
                >
                  Sign up
                </Link>
              </p>
            )}
            {step === 'forgot-password' && (
              <p className="text-slate-300 text-sm font-light">
                Enter your email to receive a password reset OTP
              </p>
            )}
            {step === 'reset-password' && (
              <p className="text-slate-300 text-sm font-light">
                Enter the OTP and your new password
              </p>
            )}
          </div>

          {/* Credentials Form */}
          {step === 'credentials' && (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/input:opacity-10 transition-opacity duration-300"></div>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="relative appearance-none rounded-xl w-full px-4 py-3 bg-slate-900/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/input:opacity-10 transition-opacity duration-300"></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative appearance-none rounded-xl w-full px-4 py-3 pr-12 bg-slate-900/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors duration-200 z-10"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (

                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('forgot-password')}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors duration-300 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="relative group/btn w-full flex justify-center py-3 px-4 rounded-xl font-semibold text-slate-900 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-xl blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300"></div>
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {step === 'forgot-password' && (
            <form className="space-y-5" onSubmit={handleForgotPassword}>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/input:opacity-10 transition-opacity duration-300"></div>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="relative appearance-none rounded-xl w-full px-4 py-3 bg-slate-900/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                className="relative group/btn w-full flex justify-center py-3 px-4 rounded-xl font-semibold text-slate-900 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
              >
                <span className="relative z-10">Send Reset OTP</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-xl blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300"></div>
              </button>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-300"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Reset Password Form */}
          {step === 'reset-password' && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="space-y-4">
                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/input:opacity-10 transition-opacity duration-300"></div>
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="relative appearance-none rounded-xl w-full px-4 py-3 bg-slate-900/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 text-center text-xl tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/input:opacity-10 transition-opacity duration-300"></div>
                  <input
                    type="password"
                    required
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="relative appearance-none rounded-xl w-full px-4 py-3 bg-slate-900/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-md opacity-0 group-hover/input:opacity-10 transition-opacity duration-300"></div>
                  <input
                    type="password"
                    required
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="relative appearance-none rounded-xl w-full px-4 py-3 bg-slate-900/40 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="relative group/btn w-full flex justify-center py-3 px-4 rounded-xl font-semibold text-slate-900 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
              >
                <span className="relative z-10">Reset Password</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-xl blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300"></div>
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-slate-400 hover:text-teal-400 transition-colors duration-300"
                >
                  ← Back to Login
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-teal-400 hover:text-teal-300 transition-colors duration-300 font-semibold"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Decorative Line */}
          <div className="mt-8 flex items-center justify-center">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -80px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}