'use client'

import Link from 'next/link'
import { Policy } from '@/types/policy'
import { MainLayout } from '@/components/shared/MainLayout'
import { BaseCard, CardHeader, CardTitle, CardContent } from '@/components/shared/BaseCard'
import { BaseButton, StatusBadge, ProgressBar } from '@/components/shared/BaseButton'
import { ProgressCircle } from '@/components/ProgressCircle'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Plus, 
  FileText, 
  BookOpen, 
  Zap,
  BarChart3,
  CheckCircle2,
  Clock,
  Search
} from 'lucide-react'

interface DashboardClientProps {
  policies: Policy[]
  stats: {
    totalPolicies: number
    activePolicies: number
    avgCompletion: number
  }
}

export function DashboardClient({ policies, stats }: DashboardClientProps) {
  return (
    <MainLayout 
      title="Dashboard"
      subtitle="Manage and track your policies efficiently"
      actions={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search policies..."
            className="pl-10 pr-4 py-2 bg-muted border border-input rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <BaseCard hover className="group">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <h3 className="text-2xl font-bold">{stats.totalPolicies}</h3>
            <p className="text-muted-foreground text-sm mt-1">Total Policies</p>
          </CardContent>
        </BaseCard>

        <BaseCard hover className="group">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <h3 className="text-2xl font-bold">{stats.activePolicies}</h3>
            <p className="text-muted-foreground text-sm mt-1">Tasks Completed</p>
          </CardContent>
        </BaseCard>

        <BaseCard hover className="group">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-warning" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <h3 className="text-2xl font-bold">3</h3>
            <p className="text-muted-foreground text-sm mt-1">Pending Reviews</p>
          </CardContent>
        </BaseCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Policies */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Policies</h2>
            <Link href="#" className="text-primary text-sm hover:text-primary/80">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {policies.map((policy, idx) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <BaseCard hover clickable padding="md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{policy.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{policy.description}</p>
                    </div>
                    <StatusBadge 
                      status={policy.status === 'active' ? 'success' : 'default'}
                    >
                      {policy.status === 'active' ? 'Active' : 'Draft'}
                    </StatusBadge>
                  </div>
                  <ProgressBar 
                    value={policy.completionPercentage} 
                    showLabel 
                    size="sm"
                  />
                </BaseCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Zoning Tip */}
          <BaseCard>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle>Zoning Tip of the Day</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                When implementing smart zoning policies, always consider the impact on existing residential areas. 
                Balance development needs with community preservation to ensure sustainable urban growth.
              </p>
            </CardContent>
          </BaseCard>

          {/* Quick Actions */}
          <BaseCard>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/generator">
                  <BaseButton variant="primary" className="w-full" icon={<Plus className="w-4 h-4" />}>
                    New Policy
                  </BaseButton>
                </Link>
                <BaseButton variant="outline" className="w-full" icon={<FileText className="w-4 h-4" />}>
                  Generate from PDF
                </BaseButton>
              </div>
            </CardContent>
          </BaseCard>
        </div>
      </div>
    </MainLayout>
  )
}
