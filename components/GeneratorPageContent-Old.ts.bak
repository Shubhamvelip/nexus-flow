'use client';

import { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { FileUploadPanel } from '@/components/FileUploadPanel';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { processPDFFile } from '@/lib/data-service';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, GitBranch } from 'lucide-react';

export function GeneratorPageContent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState<any>(null);

  const handleFileProcess = async (file: File, title: string) => {
    setIsProcessing(true);
    console.log(`[v0] Starting PDF processing: ${file.name}`);

    try {
      const result = await processPDFFile(file, title);
      if (result.success && result.data) {
        console.log('[v0] PDF processing complete:', result.data.id);
        setGeneratedPolicy(result.data);
      }
    } catch (error) {
      console.error('[v0] Error processing PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PanelGroup direction="horizontal" className="h-screen">
      {/* Left Panel - File Upload (45%) */}
      <Panel defaultSize={45} minSize={30} className="bg-black">
        <div className="h-full p-6 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-white mb-2">
              Policy Generator
            </h1>
            <p className="text-sm text-gray-400">
              Upload a PDF to automatically generate workflow and decision trees
            </p>
          </motion.div>

          <FileUploadPanel
            onFileSelect={handleFileProcess}
            isProcessing={isProcessing}
          />
        </div>
      </Panel>

      {/* Resizer */}
      <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-emerald-600 transition-colors" />

      {/* Right Panel - Preview (55%) */}
      <Panel defaultSize={55} minSize={30} className="bg-gray-950 border-l border-gray-800">
        <div className="h-full overflow-auto p-6 space-y-6">
          {generatedPolicy ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Policy Header */}
              <Card className="p-6 bg-emerald-600/10 border-emerald-600/30">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">
                    {generatedPolicy.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {generatedPolicy.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready to deploy
                  </div>
                </div>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="workflow" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-gray-800">
                  <TabsTrigger value="workflow">Workflow Steps</TabsTrigger>
                  <TabsTrigger value="tree">Decision Tree</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                </TabsList>

                {/* Workflow Steps Tab */}
                <TabsContent value="workflow" className="space-y-3 mt-4">
                  <Card className="p-4 bg-gray-900 border-gray-800">
                    <h3 className="font-semibold text-white mb-4">
                      Generated Workflow Steps
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
                        Requirements Gathering
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
                        Compliance Review
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
                        Stakeholder Approval
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
                        Implementation Planning
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
                        Final Deployment
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Decision Tree Tab */}
                <TabsContent value="tree" className="space-y-3 mt-4">
                  <Card className="p-4 bg-gray-900 border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                      <GitBranch className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-semibold text-white">
                        Interactive Decision Tree
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-emerald-600/10 border border-emerald-600/30 rounded-lg">
                        Does policy require variance?
                      </div>
                      <div className="flex gap-2 ml-4">
                        <div className="flex-1 p-3 bg-gray-800 rounded-lg text-gray-400">
                          Yes - Schedule Board Meeting
                        </div>
                        <div className="flex-1 p-3 bg-gray-800 rounded-lg text-gray-400">
                          No - Standard Review
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-600/10 border border-emerald-600/30 rounded-lg text-emerald-400">
                        Issue Final Decision
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Checklist Tab */}
                <TabsContent value="checklist" className="space-y-3 mt-4">
                  <Card className="p-4 bg-gray-900 border-gray-800">
                    <h3 className="font-semibold text-white mb-4">
                      Execution Checklist
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Application received and verified',
                        'Zoning compliance check',
                        'Environmental assessment',
                        'Community notification',
                        'Public hearing scheduled',
                        'Final approvals obtained',
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                        >
                          <div className="w-5 h-5 rounded border border-gray-600 flex items-center justify-center" />
                          <span className="text-sm text-gray-400">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center space-y-3">
                <motion.div
                  animate={{ scale: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-12 h-12 text-gray-500 mx-auto" />
                </motion.div>
                <p className="text-gray-400">
                  Upload a PDF to see generated content here
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </Panel>
    </PanelGroup>
  );
}
