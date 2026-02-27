'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate login - in production, this would call an API
    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      // Simple validation
      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Store a simple session flag (in production, use proper auth)
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-emerald-500">Nexus</span>Flow
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-gray-400">Sign in to your Nexus Flow account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-gray-800/50 border-gray-700 text-emerald-600 focus:ring-emerald-500/20"
                    disabled={loading}
                  />
                  Remember me
                </label>
                <Link href="#" className="text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/50 text-gray-400">or</span>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-300 font-medium">Demo Credentials</p>
              <div className="space-y-1 text-xs text-gray-400">
                <p>Email: <span className="text-gray-300 font-mono">demo@example.com</span></p>
                <p>Password: <span className="text-gray-300 font-mono">demo123</span></p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50"
                onClick={() => {
                  setEmail('demo@example.com');
                  setPassword('demo123');
                }}
                disabled={loading}
              >
                Use Demo Account
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="#" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign up for free
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>
              <Link href="#" className="hover:text-gray-400">Privacy Policy</Link>
              {' • '}
              <Link href="#" className="hover:text-gray-400">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
