'use client';

import Link from 'next/link';
import { Policy } from '@/types/policy';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressCircle } from '@/components/ProgressCircle';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Plus, 
  FileText, 
  LayoutDashboard, 
  FileCheck, 
  Settings,
  Search,
  BarChart3,
  CheckCircle2,
  Clock,
  User,
  BookOpen,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DashboardClientProps {
  policies: Policy[];
  stats: {
    totalPolicies: number;
    activePolicies: number;
    avgCompletion: number;
  };
}

export function DashboardClient({ policies, stats }: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Nexus Flow</h1>
              <p className="text-xs text-gray-400">Policy Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start bg-emerald-600 text-white hover:bg-emerald-700">
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Dashboard
              </Button>
            </Link>
            <Link href="/generator">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <FileCheck className="w-4 h-4 mr-3" />
                Policy Generator
              </Button>
            </Link>
            <Link href="/policies">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <FileText className="w-4 h-4 mr-3" />
                Policies
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </Link>
          </div>
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Completed</span>
              <span className="text-sm font-semibold text-emerald-500">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Pending</span>
              <span className="text-sm font-semibold text-yellow-500">3</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium">SJ</p>
              <p className="text-xs text-gray-400">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Field Officer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-950">
        {/* Top Bar */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Manage and track your policies efficiently</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-emerald-500" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <h3 className="text-2xl font-bold">24</h3>
              <p className="text-gray-400 text-sm mt-1">Total Policies</p>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="text-xs text-gray-400">Completed</span>
              </div>
              <h3 className="text-2xl font-bold">18</h3>
              <p className="text-gray-400 text-sm mt-1">Tasks Completed</p>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-yellow-500" />
                <span className="text-xs text-gray-400">Pending</span>
              </div>
              <h3 className="text-2xl font-bold">3</h3>
              <p className="text-gray-400 text-sm mt-1">Pending Reviews</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Policies */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Policies</h2>
                <Link href="#" className="text-emerald-500 text-sm hover:text-emerald-400">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {policies.map((policy, idx) => (
                  <Card key={policy.id} className="bg-gray-900 border-gray-800 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">{policy.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{policy.description}</p>
                      </div>
                      <Badge
                        className={
                          policy.status === 'active'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }
                      >
                        {policy.status === 'active' ? 'Active' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-emerald-500">{policy.completionPercentage}%</span>
                      </div>
                      <Progress value={policy.completionPercentage} className="h-2 bg-gray-700" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Zoning Tip */}
              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold">Zoning Tip of the Day</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  When implementing smart zoning policies, always consider the impact on existing residential areas. 
                  Balance development needs with community preservation to ensure sustainable urban growth.
                </p>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/generator">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      New Policy
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate from PDF
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
