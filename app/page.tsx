'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, CheckCircle2, Zap, BarChart3, Lock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('auth_token');
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-green-500">Nexus</span>Flow
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-400 hover:text-white rounded-xl px-4 py-2">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 transition-colors">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Policy Management
            <br />
            <span className="text-green-500">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Streamline policy distribution, automate workflows, and track execution in real-time. Built for government teams and field officers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 gap-2 transition-colors">
                Try Dashboard <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" className="border border-gray-700 hover:border-gray-500 bg-transparent text-white rounded-xl px-6 py-3 transition-colors">
              View Docs
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all">
            <Zap className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Instant Distribution</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Push policies to field officers instantly with real-time notifications and tracking.</p>
          </div>
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all">
            <BarChart3 className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Monitor policy execution with detailed dashboards and actionable insights.</p>
          </div>
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all">
            <Lock className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Enterprise-grade encryption and compliance for government workflows.</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8 mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-center">Why Choose Nexus Flow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              'Automated policy workflow orchestration',
              'Real-time execution tracking and reporting',
              'AI-powered policy analysis and generation',
              'Field officer mobile-first design',
              'Seamless PDF policy import and parsing',
              'Enterprise integrations and APIs',
              'Audit trails and compliance reporting',
              'Multi-language support for diverse teams',
            ].map((benefit) => (
              <div key={benefit} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Use Case Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-semibold mb-10 text-center">Enterprise Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Smart Zoning & Rent Transparency</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Manage complex zoning policies across districts with automated compliance tracking and field officer coordination.
              </p>
              <Link href="/login" className="text-green-400 hover:text-green-300 flex gap-2 items-center text-sm transition-colors">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Environmental Compliance</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Track and enforce environmental policies with real-time monitoring and automated escalation workflows.
              </p>
              <Link href="/login" className="text-green-400 hover:text-green-300 flex gap-2 items-center text-sm transition-colors">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 border border-green-500/30 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to transform your policy management?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-sm leading-relaxed">
            Join government agencies across the country who are streamlining their policy workflows with Nexus Flow.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 gap-2 transition-colors">
              Access Dashboard <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Nexus Flow. Built for government, by professionals.</p>
        </div>
      </footer>
    </div>
  );
}
