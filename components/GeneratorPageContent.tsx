'use client'

import { useState, useRef } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkflowTimeline } from '@/components/shared/WorkflowTimeline'
import { VisualDecisionTree } from '@/components/shared/VisualDecisionTree'
import { InteractiveChecklist } from '@/components/shared/InteractiveChecklist'
import {
  Zap,
  CheckCircle2,
  GitBranch,
  FileText,
  Upload,
  X,
  Loader2,
  Sparkles,
  ClipboardList,
} from 'lucide-react'



// ─── Types for API response ───────────────────────────────────────────────────
interface WorkflowStep {
  step: string;
  description: string;
}

interface DecisionTree {
  question: string;
  yes: DecisionTree | { action: string };
  no: DecisionTree | { action: string };
}

interface GeneratedOutput {
  workflow: WorkflowStep[];
  decision_tree: DecisionTree;
  checklist: string[];
}


// ─── Component ────────────────────────────────────────────────────────────────
export function GeneratorPageContent() {
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [useAI, setUseAI] = useState(true)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Output state
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState<GeneratedOutput | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)



  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type === 'application/pdf') setPdfFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPdfFile(file)
  }

  const handleGenerate = async () => {
    if (!title.trim()) return
    setIsGenerating(true)
    setApiError(null)
    setOutput(null)

    // Build input_text from form fields
    const inputParts = [
      `Title: ${title.trim()}`,
      description.trim() ? `Description: ${description.trim()}` : '',
      notes.trim() ? `Context/Notes: ${notes.trim()}` : '',
    ].filter(Boolean)
    const input_text = inputParts.join('\n\n')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), input_text }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      const policy = data.policy
      setOutput({
        workflow: policy.workflow ?? [],
        decision_tree: policy.decision_tree ?? { question: '', yes: { action: '' }, no: { action: '' } },
        checklist: policy.checklist ?? [],
      })

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setApiError(msg)
    } finally {
      setIsGenerating(false)
    }
  }


  const canGenerate = title.trim().length > 0
  const generated = output !== null


  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout title="Policy Generator">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* ── LEFT: INPUT FORM ───────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Header label */}
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Policy Input
            </span>
          </div>

          {/* Card wrapper */}
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 space-y-5">
            {/* Policy Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Policy Title <span className="text-green-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Smart Zoning & Rent Transparency Policy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#020617] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
              />
            </div>

            {/* Policy Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Policy Description
              </label>
              <textarea
                placeholder="Describe the purpose and scope of this policy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#020617] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
              />
            </div>

            {/* Notes / Context */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Notes / Context{' '}
                <span className="text-gray-600 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                placeholder="Any special requirements, regulations to reference, or stakeholder context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-[#020617] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
              />
            </div>

            {/* PDF Upload (optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Upload PDF{' '}
                <span className="text-gray-600 font-normal normal-case">(optional)</span>
              </label>
              {pdfFile ? (
                <div className="flex items-center gap-3 bg-[#020617] border border-green-500/20 rounded-xl px-4 py-3">
                  <FileText className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{pdfFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPdfFile(null)
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <motion.div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  animate={isDragActive ? { scale: 0.98 } : { scale: 1 }}
                  className={`border-2 border-dashed rounded-xl transition-all ${isDragActive
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-gray-800 hover:border-gray-700'
                    }`}
                >
                  <label className="flex items-center justify-center gap-3 p-4 cursor-pointer">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Drag PDF here or{' '}
                      <span className="text-green-400 hover:text-green-300">browse</span>
                    </span>
                  </label>
                </motion.div>
              )}
            </div>

            {/* AI Toggle */}
            <div className="flex items-center justify-between py-3 border-t border-gray-800">
              <div>
                <p className="text-sm font-medium text-white">Use AI to generate workflow</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  AI will structure steps based on your input
                </p>
              </div>
              <button
                onClick={() => setUseAI((v) => !v)}
                className="flex items-center gap-2 transition-colors"
              >
                {useAI ? (
                  <div className="flex items-center gap-1.5 bg-green-600/20 border border-green-500/30 rounded-xl px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-green-400">AI On</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                    <span className="text-xs font-medium text-gray-400">AI Off</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            whileHover={canGenerate && !isGenerating ? { scale: 1.01 } : {}}
            whileTap={canGenerate && !isGenerating ? { scale: 0.99 } : {}}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${canGenerate && !isGenerating
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Workflow…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Workflow
              </>
            )}
          </motion.button>

          {!canGenerate && (
            <p className="text-xs text-center text-gray-600">
              Enter a policy title to get started
            </p>
          )}
        </div>

        {/* ── RIGHT: OUTPUT PANEL ────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Generated Output
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              /* Loading state */
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#0f172a] border border-gray-800 rounded-2xl flex flex-col items-center justify-center py-24 gap-5"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                  </div>
                  <div className="absolute -inset-2 rounded-3xl border border-green-500/10 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-white">Generating workflow…</p>
                  <p className="text-xs text-gray-500">
                    {useAI ? 'AI is analysing your policy input' : 'Building from template'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-green-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : apiError ? (
              /* Error state */
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#0f172a] border border-red-500/20 rounded-2xl flex flex-col items-center justify-center py-16 gap-4 text-center px-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-400">Generation failed</p>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">{apiError}</p>
                </div>
                <button
                  onClick={() => setApiError(null)}
                  className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl px-4 py-2 transition-colors"
                >
                  Try again
                </button>
              </motion.div>
            ) : !generated ? (
              /* Empty / placeholder state */
              <motion.div
                key="empty"

                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#0f172a] border border-gray-800 rounded-2xl flex flex-col items-center justify-center py-24 gap-4"
              >
                <motion.div
                  animate={{ scale: [0.95, 1, 0.95] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center"
                >
                  <Zap className="w-6 h-6 text-gray-600" />
                </motion.div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-gray-400">
                    No output yet
                  </p>
                  <p className="text-xs text-gray-600">
                    Fill in the form and hit Generate Workflow
                  </p>
                </div>

                {/* Ghost preview of tabs */}
                <div className="flex gap-2 mt-2">
                  {['Workflow', 'Decision Tree', 'Checklist'].map((t) => (
                    <div
                      key={t}
                      className="px-3 py-1 bg-gray-800/40 border border-gray-800 rounded-lg text-xs text-gray-700"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Generated output */
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Success banner */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-400 font-medium">
                    Workflow generated for &quot;{title}&quot;
                  </span>
                  <button
                    onClick={() => {
                      setOutput(null)
                      setApiError(null)
                      setTitle('')
                      setDescription('')
                      setNotes('')
                      setPdfFile(null)
                    }}
                    className="ml-auto text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    Reset
                  </button>
                </div>


                <Tabs defaultValue="workflow" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[#0f172a] border border-gray-800 rounded-xl p-1 mb-4">
                    <TabsTrigger
                      value="workflow"
                      className="rounded-lg text-xs data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                    >
                      <Zap className="w-3 h-3 mr-1.5" />
                      Workflow
                    </TabsTrigger>
                    <TabsTrigger
                      value="tree"
                      className="rounded-lg text-xs data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                    >
                      <GitBranch className="w-3 h-3 mr-1.5" />
                      Decision Tree
                    </TabsTrigger>
                    <TabsTrigger
                      value="checklist"
                      className="rounded-lg text-xs data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1.5" />
                      Checklist
                    </TabsTrigger>
                  </TabsList>

                  {/* ── TAB 1: Workflow ────────────────────────────────── */}
                  <TabsContent value="workflow">
                    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <Zap className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Step-by-step Workflow</h3>
                        <span className="ml-auto text-xs text-gray-600">{output?.workflow.length ?? 0} steps</span>
                      </div>
                      <WorkflowTimeline steps={output?.workflow ?? []} />
                    </div>
                  </TabsContent>



                  {/* ── TAB 2: Decision Tree ────────────────────────────── */}
                  <TabsContent value="tree">
                    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <GitBranch className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Decision Tree</h3>
                        <span className="ml-auto text-xs text-gray-600">Interactive — click to expand</span>
                      </div>
                      <VisualDecisionTree tree={output?.decision_tree ?? null} />
                    </div>
                  </TabsContent>



                  {/* ── TAB 3: Checklist ────────────────────────────────── */}
                  <TabsContent value="checklist">
                    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Execution Checklist</h3>
                      </div>
                      <InteractiveChecklist items={output?.checklist ?? []} />
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  )
}
