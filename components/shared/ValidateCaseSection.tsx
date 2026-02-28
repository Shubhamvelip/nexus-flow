'use client';

import { useState, useRef } from 'react';
import {
    ShieldCheck, XCircle, AlertTriangle, Scale,
    Loader2, CheckCircle2, FileUp, ChevronDown, ChevronRight,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type InputMode = 'json' | 'pdf';
type RuleStatus = 'passed' | 'failed' | 'missing';
type OverallStatus = 'approved' | 'rejected' | 'needs_review';

interface RuleResult {
    ruleId: string;
    status: RuleStatus;
    message: string;
}

interface ValidationResult {
    status: OverallStatus;
    results: RuleResult[];
    message?: string;
    extractedData?: Record<string, unknown>;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<OverallStatus, { label: string; icon: React.ReactNode; cls: string }> = {
    approved: {
        label: '✅ Compliant',
        icon: <CheckCircle2 className="w-5 h-5" />,
        cls: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    },
    rejected: {
        label: '❌ Non-Compliant',
        icon: <XCircle className="w-5 h-5" />,
        cls: 'bg-red-500/15 border-red-500/30 text-red-400',
    },
    needs_review: {
        label: '⚠️ Needs Review',
        icon: <AlertTriangle className="w-5 h-5" />,
        cls: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    },
};

const RULE_ICON: Record<RuleStatus, React.ReactNode> = {
    passed: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />,
    failed: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />,
    missing: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />,
};

const RULE_STATUS_LABEL: Record<RuleStatus, string> = {
    passed: 'PASSED',
    failed: 'FAILED',
    missing: 'MISSING',
};

// ── Sub-component: Results ────────────────────────────────────────────────────

function ValidationResults({ result }: { result: ValidationResult }) {
    const [showExtracted, setShowExtracted] = useState(false);
    const s = STATUS_MAP[result.status];

    return (
        <div className="space-y-4 pt-1">
            {/* Overall status */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold text-base ${s.cls}`}>
                {s.icon}
                {s.label}
                {result.message && (
                    <span className="ml-1 text-xs font-normal text-gray-400">{result.message}</span>
                )}
            </div>

            {/* Rule-by-rule breakdown */}
            {result.results.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detailed Breakdown</p>
                    {result.results.map(r => (
                        <div key={r.ruleId} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-900/70 border border-gray-800">
                            {RULE_ICON[r.status]}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-xs font-mono text-gray-500">{r.ruleId}</p>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' :
                                            r.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                'bg-amber-500/20 text-amber-400'
                                        }`}>{RULE_STATUS_LABEL[r.status]}</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-snug">{r.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-500 italic">No rules defined for this policy yet. Re-generate the policy to extract rules.</p>
            )}

            {/* Extracted data (PDF mode only, collapsible) */}
            {result.extractedData && Object.keys(result.extractedData).length > 0 && (
                <div className="rounded-xl border border-gray-800 overflow-hidden">
                    <button
                        onClick={() => setShowExtracted(v => !v)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-900/50 text-xs font-semibold text-gray-400 hover:text-white transition-colors text-left"
                    >
                        {showExtracted
                            ? <ChevronDown className="w-3.5 h-3.5" />
                            : <ChevronRight className="w-3.5 h-3.5" />}
                        Extracted Case Data (from PDF)
                    </button>
                    {showExtracted && (
                        <pre className="px-4 py-3 bg-[#080e1a] text-xs text-gray-300 font-mono overflow-x-auto">
                            {JSON.stringify(result.extractedData, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ValidateCaseSectionProps {
    policyId: string;
}

export function ValidateCaseSection({ policyId }: ValidateCaseSectionProps) {
    const [mode, setMode] = useState<InputMode>('json');

    // JSON mode state
    const [caseInput, setCaseInput] = useState('');

    // PDF mode state
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Shared state
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetResult = () => {
        setResult(null);
        setError(null);
    };

    // ── JSON validation ──────────────────────────────────────────────────────
    const handleJsonValidate = async () => {
        resetResult();
        let caseData: Record<string, unknown>;
        try {
            caseData = JSON.parse(caseInput || '{}');
        } catch {
            setError('Invalid JSON — please check your input format.');
            return;
        }
        const payload = { policyId, caseData };
        console.log('[ValidateCase/JSON] REQUEST →', JSON.stringify(payload, null, 2));
        setIsLoading(true);
        try {
            const res = await fetch('/api/validate-case', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log('[ValidateCase/JSON] RESPONSE ←', JSON.stringify(data, null, 2));
            if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
            setResult(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Validation failed';
            console.error('[ValidateCase/JSON] ERROR:', msg);
            setError('Validation failed. Check input format.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── PDF validation ───────────────────────────────────────────────────────
    const handlePdfValidate = async () => {
        resetResult();
        if (!pdfFile) {
            setError('Please select a PDF file first.');
            return;
        }
        const formData = new FormData();
        formData.append('policyId', policyId);
        formData.append('pdf', pdfFile);
        console.log('[ValidateCase/PDF] Uploading', pdfFile.name, '—', pdfFile.size, 'bytes');
        setIsLoading(true);
        try {
            const res = await fetch('/api/extract-case', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            console.log('[ValidateCase/PDF] RESPONSE ←', JSON.stringify(data, null, 2));
            if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
            setResult(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Extraction failed';
            console.error('[ValidateCase/PDF] ERROR:', msg);
            setError(msg.includes('extract') ? msg : 'Validation failed. Check input format.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full rounded-2xl border border-blue-500/20 bg-[#0c1424] p-6 space-y-5 mt-6">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-800">
                <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Scale className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white">Validate Case</h2>
                    <p className="text-xs text-gray-500">Test a real case against this policy's rules</p>
                </div>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1 p-1 bg-gray-900 rounded-xl w-fit border border-gray-800">
                {(['json', 'pdf'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => { setMode(m); resetResult(); }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${mode === m
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {m === 'json' ? '{ }  JSON Input' : <><FileUp className="w-3.5 h-3.5" />Upload PDF</>}
                    </button>
                ))}
            </div>

            {/* ── JSON mode ──────────────────────────────────────────────────── */}
            {mode === 'json' && (
                <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-400">Case Data (JSON)</label>
                    <textarea
                        value={caseInput}
                        onChange={e => setCaseInput(e.target.value)}
                        placeholder={'Enter case data in JSON format\n{\n  "age": 25,\n  "income": 50000,\n  "citizen": true\n}'}
                        rows={7}
                        spellCheck={false}
                        className="w-full resize-none rounded-xl border border-gray-700 bg-[#080e1a] text-sm text-gray-200 font-mono p-4 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 placeholder:text-gray-700 transition-all"
                    />
                    <button
                        onClick={handleJsonValidate}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        {isLoading ? 'Validating…' : 'Validate Case'}
                    </button>
                </div>
            )}

            {/* ── PDF mode ───────────────────────────────────────────────────── */}
            {mode === 'pdf' && (
                <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-400">Upload Case Document (PDF)</label>

                    {/* Drop zone */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all ${pdfFile
                                ? 'border-blue-500/50 bg-blue-500/5'
                                : 'border-gray-700 hover:border-gray-500 bg-[#080e1a]'
                            }`}
                    >
                        <FileUp className={`w-8 h-8 ${pdfFile ? 'text-blue-400' : 'text-gray-600'}`} />
                        {pdfFile ? (
                            <>
                                <p className="text-sm font-semibold text-blue-300">{pdfFile.name}</p>
                                <p className="text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(1)} KB — click to change</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-400">Click to upload a PDF</p>
                                <p className="text-xs text-gray-600">Only PDF files are accepted</p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={e => {
                                const f = e.target.files?.[0] ?? null;
                                setPdfFile(f);
                                resetResult();
                            }}
                        />
                    </div>

                    <button
                        onClick={handlePdfValidate}
                        disabled={isLoading || !pdfFile}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        {isLoading ? 'Extracting & Validating…' : 'Extract & Validate'}
                    </button>

                    {isLoading && (
                        <p className="text-xs text-gray-500 animate-pulse">
                            AI is reading the PDF and extracting case data…
                        </p>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {/* Results */}
            {result && <ValidationResults result={result} />}
        </div>
    );
}
