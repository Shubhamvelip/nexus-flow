'use client'

import { useState } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { FileUploadPanel } from '@/components/FileUploadPanel'
import { MainLayout } from '@/components/shared/MainLayout'
import { BaseCard, CardHeader, CardTitle, CardContent } from '@/components/shared/BaseCard'
import { BaseButton, StatusBadge, ProgressBar } from '@/components/shared/BaseButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { processPDFFile } from '@/lib/data-service'
import { motion } from 'framer-motion'
import { Zap, CheckCircle2, GitBranch } from 'lucide-react'

export function GeneratorPageContent() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedPolicy, setGeneratedPolicy] = useState<any>(null)

  const handleFileProcess = async (file: File, title: string) => {
    setIsProcessing(true)
    console.log(`[v0] Starting PDF processing: ${file.name}`)

    try {
      const result = await processPDFFile(file, title)
      if (result.success && result.data) {
        console.log('[v0] PDF processing complete:', result.data.id)
        setGeneratedPolicy(result.data)
      }
    } catch (error) {
      console.error('[v0] Error processing PDF:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <MainLayout 
      title="Policy Generator"
      subtitle="Upload a PDF to automatically generate workflow and decision trees"
      showSidebar={false}
    >
      <PanelGroup direction="horizontal" className="h-[calc(100vh-8rem)]">
        {/* Left Panel - File Upload (45%) */}
        <Panel defaultSize={45} minSize={30} className="bg-background">
          <div className="h-full p-6 flex flex-col">
            <FileUploadPanel
              onFileSelect={handleFileProcess}
              isProcessing={isProcessing}
            />
          </div>
        </Panel>

        {/* Resizer */}
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />

        {/* Right Panel - Preview (55%) */}
        <Panel defaultSize={55} minSize={30} className="bg-card border-l border-border">
          <div className="h-full overflow-auto p-6">
            {generatedPolicy ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Policy Header */}
                <BaseCard variant="elevated">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-primary">Ready to deploy</span>
                      </div>
                      <h2 className="text-2xl font-bold">{generatedPolicy.title}</h2>
                      <p className="text-muted-foreground">{generatedPolicy.description}</p>
                    </div>
                  </CardContent>
                </BaseCard>

                {/* Tabs */}
                <Tabs defaultValue="workflow" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-muted border border-input">
                    <TabsTrigger value="workflow">Workflow Steps</TabsTrigger>
                    <TabsTrigger value="tree">Decision Tree</TabsTrigger>
                    <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  </TabsList>

                  {/* Workflow Steps Tab */}
                  <TabsContent value="workflow" className="space-y-4 mt-6">
                    <BaseCard>
                      <CardHeader>
                        <CardTitle>Generated Workflow Steps</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            'Requirements Gathering',
                            'Compliance Review', 
                            'Stakeholder Approval',
                            'Implementation Planning',
                            'Final Deployment'
                          ].map((step, idx) => (
                            <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                              {step}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </BaseCard>
                  </TabsContent>

                  {/* Decision Tree Tab */}
                  <TabsContent value="tree" className="space-y-4 mt-6">
                    <BaseCard>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-primary" />
                          <CardTitle>Interactive Decision Tree</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 text-sm">
                          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                            Does policy require variance?
                          </div>
                          <div className="flex gap-2 ml-4">
                            <div className="flex-1 p-3 bg-muted rounded-lg">
                              Yes - Schedule Board Meeting
                            </div>
                            <div className="flex-1 p-3 bg-muted rounded-lg">
                              No - Standard Review
                            </div>
                          </div>
                          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary">
                            Issue Final Decision
                          </div>
                        </div>
                      </CardContent>
                    </BaseCard>
                  </TabsContent>

                  {/* Checklist Tab */}
                  <TabsContent value="checklist" className="space-y-4 mt-6">
                    <BaseCard>
                      <CardHeader>
                        <CardTitle>Execution Checklist</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            'Application received and verified',
                            'Zoning compliance check',
                            'Environmental assessment',
                            'Community notification',
                            'Public hearing scheduled',
                            'Final approvals obtained'
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                              <div className="w-5 h-5 rounded border border-input flex items-center justify-center" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </BaseCard>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto" />
                  </motion.div>
                  <p className="text-muted-foreground">
                    Upload a PDF to see generated content here
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </MainLayout>
  )
}
