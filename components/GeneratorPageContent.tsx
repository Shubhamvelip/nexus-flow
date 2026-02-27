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
  Download,
  Share2,
  Save,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { exportPolicyToPDF } from '@/lib/export'

import { PolicyChecklistItem, PolicyDecisionTree, PolicyWorkflowStep } from '@/lib/firebase'

// ─── Types for API response ───────────────────────────────────────────────────

interface GeneratedOutput {
  id: string;
  workflow: PolicyWorkflowStep[];
  decision_tree: PolicyDecisionTree;
  checklist: PolicyChecklistItem[];
}


// ─── Component ────────────────────────────────────────────────────────────────
export function GeneratorPageContent() {
  // Form state
  const [title, setTitle] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [useAI, setUseAI] = useState(true)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [output, setOutput] = useState<GeneratedOutput | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const { user } = useAuth()

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
    setHasSaved(false)

    // Build input_text from form fields
    const inputParts = [
      `Title: ${title.trim()}`,
      pasteText.trim() ? `Policy Text:\n${pasteText.trim()}` : '',
      description.trim() ? `Description: ${description.trim()}` : '',
      notes.trim() ? `Context/Notes: ${notes.trim()}` : '',
    ].filter(Boolean)
    const input_text = inputParts.join('\n\n')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), input_text, userId: user?.uid }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      const policy = data.policy
      setOutput({
        id: policy.id,
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


  const handleSave = async () => {
    if (!output || !user?.uid || hasSaved) return;
    setIsSaving(true);
    try {
      // Build input_text from form fields
      const inputParts = [
        `Title: ${title.trim()}`,
        pasteText.trim() ? `Policy Text:\n${pasteText.trim()}` : '',
        description.trim() ? `Description: ${description.trim()}` : '',
        notes.trim() ? `Context/Notes: ${notes.trim()}` : '',
      ].filter(Boolean)
      const input_text = inputParts.join('\n\n')

      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          input_text,
          workflow: output.workflow,
          decision_tree: output.decision_tree,
          checklist: output.checklist,
          userId: user.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save policy');

      setHasSaved(true);
      toast.success('Policy saved successfully');

      // Update local output with the real DB id
      if (data.policy?.id) {
        setOutput(prev => prev ? { ...prev, id: data.policy.id } : null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error saving policy';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!output?.id || !hasSaved) {
      toast.error("Please save the policy before sharing");
      return;
    }
    const url = `${window.location.origin}/policies/${output.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const canGenerate = title.trim().length > 0
  const generated = output !== null

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })


  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout title="Policy Generator">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full min-h-[calc(100vh-10rem)]">
        {/* ── LEFT: INPUT FORM ───────────────────────────────────────────── */}
        <div className="space-y-4 lg:col-span-2 flex flex-col">
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

            {/* Paste Policy Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Paste Policy Text
              </label>
              <textarea
                placeholder="Paste full government policy document here..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={8}
                className="w-full bg-[#020617] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
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
                Generate Workflow with AI
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
        <div className="space-y-4 lg:col-span-3 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Generated Output
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                disabled={!generated || isGenerating}
                className="p-2 rounded-xl bg-[#020617] border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => output && exportPolicyToPDF({
                  title,
                  description,
                  workflow: output.workflow,
                  decisionTree: output.decision_tree,
                  checklist: output.checklist,
                })}
                disabled={!generated || isGenerating}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#020617] border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as PDF"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleSave}
                disabled={!generated || isGenerating || isSaving || hasSaved || !user}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-semibold shadow-lg ${hasSaved
                  ? 'bg-gray-800 text-green-400 border border-green-500/20 shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed'
                  }`}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasSaved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Saving…' : hasSaved ? 'Saved' : 'Save Policy'}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              /* Loading state */
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#0f172a] border border-gray-800 rounded-2xl flex flex-col items-center justify-center flex-1 min-h-[400px] gap-5"
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
                className="bg-[#0f172a] border border-red-500/20 rounded-2xl flex flex-col items-center justify-center flex-1 min-h-[400px] gap-4 text-center px-6"
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
                className="bg-[#0f172a] border border-gray-800 rounded-2xl flex flex-col items-center justify-center flex-1 min-h-[400px] gap-4"
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
                {/* Header Section */}
                <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                          Generated
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="w-3 h-3" />
                          {timestamp}
                        </div>
                      </div>
                      <h2 className="text-xl font-semibold text-white leading-tight">
                        {title}
                      </h2>
                    </div>

                  </div>
                </div>


                <Tabs defaultValue="workflow" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[#0f172a] border border-gray-800 rounded-xl p-1 mb-6 relative">
                    <TabsTrigger
                      value="workflow"
                      className="rounded-lg text-xs z-10 data-[state=active]:text-white transition-colors py-2"
                    >
                      <Zap className="w-3.5 h-3.5 mr-2" />
                      Workflow
                    </TabsTrigger>
                    <TabsTrigger
                      value="tree"
                      className="rounded-lg text-xs z-10 data-[state=active]:text-white transition-colors py-2"
                    >
                      <GitBranch className="w-3.5 h-3.5 mr-2" />
                      Decision Tree
                    </TabsTrigger>
                    <TabsTrigger
                      value="checklist"
                      className="rounded-lg text-xs z-10 data-[state=active]:text-white transition-colors py-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                      Checklist
                    </TabsTrigger>
                  </TabsList>

                  {/* ── TAB 1: Workflow ────────────────────────────────── */}
                  <TabsContent value="workflow" className="mt-0 outline-none">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/60">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <Zap className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Step-by-step Workflow</h3>
                        <span className="ml-auto text-xs text-gray-600">{output?.workflow.length ?? 0} steps</span>
                      </div>
                      <WorkflowTimeline steps={output?.workflow ?? []} />
                    </motion.div>
                  </TabsContent>



                  {/* ── TAB 2: Decision Tree ────────────────────────────── */}
                  <TabsContent value="tree" className="mt-0 outline-none">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-800/60">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <GitBranch className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Decision Tree</h3>
                        <span className="ml-auto text-xs text-gray-600">Interactive — click to expand</span>
                      </div>
                      <VisualDecisionTree tree={output?.decision_tree ?? null} />
                    </motion.div>
                  </TabsContent>



                  {/* ── TAB 3: Checklist ────────────────────────────────── */}
                  <TabsContent value="checklist" className="mt-0 outline-none">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/60">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Execution Checklist</h3>
                      </div>
                      <InteractiveChecklist
                        items={output?.checklist ?? []}
                        policyId={output?.id}
                        onUpdate={(updatedChecklist) => setOutput(prev => prev ? { ...prev, checklist: updatedChecklist } : null)}
                      />
                    </motion.div>
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
