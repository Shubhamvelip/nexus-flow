import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const policyId = formData.get('policyId') as string;
        const file = formData.get('pdf') as File | null;

        if (!policyId) {
            return NextResponse.json({ error: 'policyId is required' }, { status: 400 });
        }
        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'A PDF file is required' }, { status: 400 });
        }

        // Convert PDF to base64
        const arrayBuf = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString('base64');

        // Fetch policy rules so Gemini knows what fields to extract
        let policyRules: Array<{ field: string; description: string }> = [];
        try {
            const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const policyRes = await fetch(`${base}/api/policies/${policyId}`);
            if (policyRes.ok) {
                const policyData = await policyRes.json();
                policyRules = (policyData?.policy?.rules ?? []).map(
                    (r: { field: string; description: string }) => ({ field: r.field, description: r.description })
                );
            }
        } catch {
            // Non-fatal — Gemini will still do its best without rule hints
        }

        const rulesHint = policyRules.length > 0
            ? `The policy has these rules that check the following fields:\n${policyRules.map(r => `  - "${r.field}": ${r.description}`).join('\n')}\n\nExtract values for ALL of these fields if present.`
            : 'Extract all measurable facts, values, conditions, dates, and boolean states.';

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a case data extractor. Read the uploaded PDF document and extract structured case data as a flat JSON object.

${rulesHint}

Rules:
- Output ONLY a valid JSON object, no markdown, no explanation
- Keys must be camelCase short identifiers (e.g. "age", "wasteSegregated", "collectionTime")
- Values must be: string, number, or boolean only
- Do NOT nest objects
- If a field is not present in the document, omit it
- Extract ALL measurable facts you find

Example output:
{
  "age": 25,
  "citizen": true,
  "income": 45000,
  "wasteSegregated": true,
  "collectionTime": "8:30",
  "hazardousPresent": false
}`;

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: base64,
                },
            },
            { text: prompt },
        ]);

        const raw = result.response.text().trim();
        console.log('[ExtractCase] Gemini raw:', raw);

        // Parse extracted JSON
        let extractedData: Record<string, unknown> = {};
        try {
            // Strip markdown fences if present
            const cleaned = raw.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                extractedData = JSON.parse(cleaned.slice(start, end + 1));
            } else {
                throw new Error('No JSON object found in AI response');
            }
        } catch (parseErr) {
            console.error('[ExtractCase] Parse error:', parseErr);
            return NextResponse.json({
                error: 'AI could not extract structured data from this PDF. Please check the document or use JSON input instead.',
                rawResponse: raw,
            }, { status: 422 });
        }

        // Now run validation using the existing validate-case logic
        const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const validationRes = await fetch(`${base}/api/validate-case`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ policyId, caseData: extractedData }),
        });
        const validationResult = await validationRes.json();

        return NextResponse.json({
            extractedData,
            ...validationResult,
        }, { status: 200 });

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[POST /api/extract-case]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
