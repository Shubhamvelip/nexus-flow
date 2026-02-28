import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || '');

// ── Helper: detect rate-limit errors ────────────────────────────────────────
// GoogleGenerativeAIFetchError has a numeric `.status` field — check that too.
function isQuotaError(err: unknown): boolean {
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 429) {
        return true;
    }
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('too many requests');
}


export async function POST(request: NextRequest) {
    let uploadedFileName: string | null = null;

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

        // ── 1. Upload the PDF via Gemini File API (no base64 inline data) ─────
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log('[ExtractCase] Uploading PDF to Gemini File API …');

        let uploadResponse;
        try {
            uploadResponse = await fileManager.uploadFile(buffer, {
                mimeType: 'application/pdf',
                displayName: file.name,
            });
        } catch (uploadErr) {
            console.error('[ExtractCase] uploadFile error:', uploadErr);
            if (isQuotaError(uploadErr)) {
                return NextResponse.json(
                    { error: 'API rate limit exceeded. Please wait a moment and try again.' },
                    { status: 429 }
                );
            }
            throw uploadErr;
        }

        uploadedFileName = uploadResponse.file.name;   // keep for cleanup
        const fileUri = uploadResponse.file.uri;
        console.log('[ExtractCase] File uploaded →', fileUri);

        // ── 2. Fetch policy rules so Gemini knows what fields to extract ───────
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

        // ── 3. Run native PDF extraction via Gemini ────────────────────────────
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

        let result;
        try {
            result = await model.generateContent([
                {
                    fileData: {
                        mimeType: 'application/pdf',
                        fileUri,
                    },
                },
                { text: prompt },
            ]);
        } catch (genErr) {
            if (isQuotaError(genErr)) {
                return NextResponse.json(
                    { error: 'API rate limit exceeded. Please wait a moment and try again.' },
                    { status: 429 }
                );
            }
            throw genErr;
        }

        const raw = result.response.text().trim();
        console.log('[ExtractCase] Gemini raw:', raw);

        // ── 4. Parse extracted JSON ─────────────────────────────────────────────
        let extractedData: Record<string, unknown> = {};
        try {
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

        // ── 5. Run validation ───────────────────────────────────────────────────
        const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const validationRes = await fetch(`${base}/api/validate-case`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ policyId, caseData: extractedData }),
        });
        const validationResult = await validationRes.json();

        return NextResponse.json(
            { extractedData, ...validationResult },
            { status: 200 }
        );

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        // Log the full error object so the real status/message is visible in the server terminal
        console.error('[POST /api/extract-case] raw error:', err);

        if (isQuotaError(err)) {
            return NextResponse.json(
                { error: 'API rate limit exceeded. Please wait a moment and try again.' },
                { status: 429 }
            );
        }
        return NextResponse.json({ error: message }, { status: 500 });

    } finally {
        // ── 6. Always delete the Gemini-hosted file to avoid stale uploads ──────
        if (uploadedFileName) {
            fileManager.deleteFile(uploadedFileName).catch(() => { /* best-effort */ });
        }
    }
}
