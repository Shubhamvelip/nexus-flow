'use client';

import { useState } from 'react';
import { PDFUpload } from './PDFUpload';
import { PreviewPanel } from './PreviewPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  mockWorkflowSteps,
  mockDecisionTree,
  mockChecklist,
} from '@/lib/mockData';
import { WorkflowStep, DecisionNode, ChecklistItem } from '@/lib/types';

export function GeneratorContent() {
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<
    'idle' | 'uploading' | 'processing' | 'complete'
  >('idle');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [decisionTree, setDecisionTree] = useState<DecisionNode[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = (file: File) => {
    setFileName(file.name);
    setProcessingStep('idle');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setProcessingStep('uploading');

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 800));
    setProcessingStep('processing');

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Set mock data
    setWorkflowSteps(mockWorkflowSteps);
    setDecisionTree(mockDecisionTree);
    setChecklist(mockChecklist);

    if (!title) {
      setTitle('Smart Zoning & Rent Transparency Policy');
    }

    setProcessingStep('complete');
    setIsProcessing(false);
  };

  const handleSaveToDashboard = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Policy Generator</h1>
        <p className="text-muted-foreground">
          Upload a PDF to automatically extract and structure policy content
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Left Panel - Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Upload PDF Document
            </h2>
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF (max 50MB)
            </p>
          </div>

          <PDFUpload
            onFileSelect={handleFileSelect}
            onTitleChange={handleTitleChange}
            fileName={fileName}
            title={title}
            isProcessing={isProcessing}
          />

          {/* Processing Status */}
          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <Card className="p-4 bg-muted border-border">
                  <div className="space-y-2">
                    {(['uploading', 'processing', 'complete'] as const).map(
                      (step) => (
                        <div
                          key={step}
                          className="flex items-center gap-3"
                        >
                          <motion.div
                            animate={
                              processingStep === step
                                ? { rotate: 360 }
                                : { rotate: 0 }
                            }
                            transition={{
                              duration: 1,
                              repeat:
                                processingStep === step ? Infinity : 0,
                            }}
                            className="w-5 h-5 flex items-center justify-center"
                          >
                            {processingStep === step ? (
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            ) : processingStep > step ? (
                              <Check className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <div className="w-4 h-4 border border-muted-foreground rounded-full"></div>
                            )}
                          </motion.div>
                          <span
                            className={`text-sm capitalize ${
                              processingStep === step
                                ? 'font-semibold text-foreground'
                                : processingStep > step
                                  ? 'text-emerald-500 font-medium'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {step === 'uploading'
                              ? 'Uploading PDF'
                              : step === 'processing'
                                ? 'Processing with AI'
                                : 'Complete'}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          {!isProcessing && processingStep !== 'complete' && (
            <Button
              onClick={handleProcess}
              disabled={!fileName}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process PDF
            </Button>
          )}

          {processingStep === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Policy processed successfully!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review the preview and save to dashboard
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSaveToDashboard}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted"
              >
                Generate Another
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Right Panel - Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full"
        >
          {processingStep === 'complete' ? (
            <PreviewPanel
              workflowSteps={workflowSteps}
              decisionTree={decisionTree}
              checklist={checklist}
            />
          ) : (
            <Card className="h-full bg-card border-border flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground">
                No preview available
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Process a PDF document to see the extracted workflow steps,
                decision tree, and checklist here.
              </p>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 p-4 bg-emerald-500 text-white rounded-lg shadow-lg flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">
              Policy saved to dashboard successfully!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
