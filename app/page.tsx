'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, CheckCircle2, Zap, BarChart3, Lock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated (has saved session)
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('auth_token');
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation Bar */}
      <nav className="border-b border-border sticky top-0 z-50 bg-card/80 backdrop-blur-sm">
        <div className="container-standard py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Nexus</span>Flow
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-standard py-20">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Policy Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Streamline policy distribution, automate workflows, and track execution in real-time. Built for government teams and field officers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                Try Dashboard <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border hover:bg-accent hover:text-accent-foreground">
              View Docs
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:border-emerald-500/50 transition-colors">
            <Zap className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Instant Distribution</h3>
            <p className="text-gray-400">Push policies to field officers instantly with real-time notifications and tracking.</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:border-emerald-500/50 transition-colors">
            <BarChart3 className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
            <p className="text-gray-400">Monitor policy execution with detailed dashboards and actionable insights.</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 hover:border-emerald-500/50 transition-colors">
            <Lock className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <p className="text-gray-400">Enterprise-grade encryption and compliance for government workflows.</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Nexus Flow?</h2>
          <div className="grid md:grid-cols-2 gap-8">
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
              <div key={benefit} className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Use Case Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Enterprise Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-3 text-emerald-400">Smart Zoning & Rent Transparency</h3>
              <p className="text-gray-300 mb-4">
                Manage complex zoning policies across districts with automated compliance tracking and field officer coordination.
              </p>
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 flex gap-2 items-center">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-3 text-emerald-400">Environmental Compliance</h3>
              <p className="text-gray-300 mb-4">
                Track and enforce environmental policies with real-time monitoring and automated escalation workflows.
              </p>
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 flex gap-2 items-center">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your policy management?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join government agencies across the country who are streamlining their policy workflows with Nexus Flow.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              Access Dashboard <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-12 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2025 Nexus Flow. Built for government, by professionals.</p>
        </div>
      </footer>
    </div>
  );
}
