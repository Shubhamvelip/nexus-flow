'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, CheckCircle2, XCircle, AlertTriangle, Scale } from 'lucide-react';

type RuleStatus = 'passed' | 'failed' | 'missing';

interface RuleResult {
    ruleId: string;
    status: RuleStatus;
    message: string;
}

interface ValidationResponse {
    status: 'approved' | 'rejected' | 'needs_review';
    results: RuleResult[];
    message?: string;
}

interface Props {
    policyId: string;
}

const STATUS_CONFIG = {
    approved: { label: 'Approved', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4" /> },
    rejected: { label: 'Rejected', bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', icon: <XCircle className="w-4 h-4" /> },
    needs_review: { label: 'Needs Review', bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', icon: <AlertTriangle className="w-4 h-4" /> },
};

const RULE_ICON: Record<RuleStatus, React.ReactElement> = {
    passed: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />,
    failed: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />,
    missing: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />,
};

const PLACEHOLDER_CASE = `{
  "age": 25,
  "income": 50000,
  "citizen": true
}`;

export function ValidateCasePanel({ policyId }: Props) {
    const [caseInput, setCaseInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ValidationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleValidate = async () => {
        setError(null);
        setResult(null);

        let caseData: Record<string, unknown>;
        try {
            caseData = JSON.parse(caseInput || '{}');
        } catch {
            setError('Invalid JSON — please check your case data.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/validate-case', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ policyId, caseData }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
            setResult(data as ValidationResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Validation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const cfg = result ? STATUS_CONFIG[result.status] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0f172a] border border-gray-800 rounded-2xl p-5 space-y-4"
        >
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Scale className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Validate Case</h2>
                <span className="ml-auto text-xs text-gray-600">Enter case data as JSON</span>
            </div>

            {/* Textarea */}
            <div className="relative">
                <textarea
                    value={caseInput}
                    onChange={e => setCaseInput(e.target.value)}
                    placeholder={PLACEHOLDER_CASE}
                    rows={6}
                    spellCheck={false}
                    className="w-full resize-none rounded-xl border border-gray-700/60 bg-[#080e1a] text-xs text-gray-300 font-mono p-3.5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder:text-gray-700 transition-colors"
                />
            </div>

            {/* Button */}
            <button
                onClick={handleValidate}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-900/20"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <ShieldCheck className="w-4 h-4" />
                )}
                {isLoading ? 'Validating…' : 'Validate Case'}
            </button>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25"
                    >
                        <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {result && cfg && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="space-y-3"
                    >
                        {/* Overall status badge */}
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                            <span className={cfg.text}>{cfg.icon}</span>
                            <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                            {result.message && (
                                <span className="text-xs text-gray-500 ml-1">{result.message}</span>
                            )}
                        </div>

                        {/* Per-rule results */}
                        {result.results.length > 0 && (
                            <div className="space-y-2">
                                {result.results.map(r => (
                                    <div
                                        key={r.ruleId}
                                        className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800/60"
                                    >
                                        {RULE_ICON[r.status]}
                                        <div className="min-w-0">
                                            <p className="text-xs font-mono text-gray-500">{r.ruleId}</p>
                                            <p className="text-xs text-gray-300 leading-snug mt-0.5">{r.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
