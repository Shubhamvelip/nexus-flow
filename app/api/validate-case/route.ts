import { NextRequest, NextResponse } from 'next/server';
import { getPolicyById } from '@/lib/firebase';
import type { PolicyRule } from '@/lib/firebase';

type Operator = '>' | '<' | '>=' | '<=' | '==' | '!=';

function evaluate(caseValue: unknown, operator: Operator, ruleValue: unknown): boolean {
    // Coerce to numbers if both sides look numeric
    const numCase = Number(caseValue);
    const numRule = Number(ruleValue);
    const useNum = !isNaN(numCase) && !isNaN(numRule as number);

    if (useNum) {
        switch (operator) {
            case '>': return numCase > numRule;
            case '<': return numCase < numRule;
            case '>=': return numCase >= numRule;
            case '<=': return numCase <= numRule;
            case '==': return numCase === numRule;
            case '!=': return numCase !== numRule;
        }
    }
    // Fallback: string comparison
    switch (operator) {
        case '==': return String(caseValue) === String(ruleValue);
        case '!=': return String(caseValue) !== String(ruleValue);
        default: return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { policyId, caseData } = body as { policyId: string; caseData: Record<string, unknown> };

        if (!policyId || typeof policyId !== 'string') {
            return NextResponse.json({ error: 'policyId is required' }, { status: 400 });
        }
        if (!caseData || typeof caseData !== 'object') {
            return NextResponse.json({ error: 'caseData must be an object' }, { status: 400 });
        }

        // Fetch policy
        const policy = await getPolicyById(policyId);
        if (!policy) {
            return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
        }

        const rules: PolicyRule[] = Array.isArray(policy.rules) ? policy.rules : [];

        if (rules.length === 0) {
            return NextResponse.json({
                status: 'approved',
                results: [],
                message: 'No rules defined for this policy.',
            }, { status: 200 });
        }

        type RuleStatus = 'passed' | 'failed' | 'missing';

        const results: Array<{ ruleId: string; status: RuleStatus; message: string }> = rules.map((rule) => {
            const fieldValue = caseData[rule.field];

            if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                return {
                    ruleId: rule.id,
                    status: 'missing' as RuleStatus,
                    message: `Field "${rule.field}" is missing from case data`,
                };
            }

            const passed = evaluate(fieldValue, rule.operator as Operator, rule.value);
            return {
                ruleId: rule.id,
                status: (passed ? 'passed' : 'failed') as RuleStatus,
                message: passed
                    ? rule.description
                    : `Failed: ${rule.field} ${rule.operator} ${rule.value} (got: ${fieldValue})`,
            };
        });

        // Determine overall status
        const anyFailed = results.some(r => r.status === 'failed');
        const anyMissing = results.some(r => r.status === 'missing');
        const overallStatus = anyFailed ? 'rejected' : anyMissing ? 'needs_review' : 'approved';

        return NextResponse.json({ status: overallStatus, results }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[POST /api/validate-case]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
