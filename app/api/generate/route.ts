import { NextRequest, NextResponse } from 'next/server';
import { generatePolicy, PolicyInput } from '@/lib/ai';

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let title = '';
        let policyText = '';
        let description = '';
        let notes = '';
        let userId = '';
        let file: File | null = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            title = (formData.get('title') as string) || '';
            policyText = (formData.get('input_text') as string) || '';
            description = (formData.get('description') as string) || '';
            notes = (formData.get('notes') as string) || '';
            userId = (formData.get('userId') as string) || '';
            file = formData.get('pdf') as File | null;
        } else {
            const body = await request.json();
            title = body.title || '';
            policyText = body.input_text || '';
            description = body.description || '';
            notes = body.notes || '';
            userId = body.userId || '';
        }

        let pdfBase64: string | undefined = undefined;

        if (file) {
            try {
                const arrayBuf = await file.arrayBuffer();
                pdfBase64 = Buffer.from(arrayBuf).toString('base64');
            } catch (err) {
                console.error("PDF read error:", err);
            }
        }

        const hasTextContent = !!policyText?.trim() || !!description?.trim() || !!notes?.trim();

        if (!hasTextContent && (!file || !pdfBase64)) {
            return NextResponse.json(
                { error: 'Provide at least a policy text, description, or PDF.' },
                { status: 400 }
            );
        }

        const finalInput = `
${policyText || ""}
${description || ""}
${notes || ""}
`.trim();

        console.log("Final input length:", finalInput.length);

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json(
                { error: 'userId is required and must be a string' },
                { status: 400 }
            );
        }

        // Validate input
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json(
                { error: 'title is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // 1. Generate structured output via Gemini
        const policyInput: PolicyInput = {
            title: title.trim(),
            policyText: finalInput,
            pdfBase64,
        };
        const generated = await generatePolicy(policyInput);

        // 2. Return formatted policy object
        const policy = {
            title: title.trim(),
            input_text: finalInput.trim(),
            workflow: generated.workflow,
            decision_tree: generated.decision_tree,
            checklist: generated.checklist.map((text, idx) => ({
                id: `item-${Date.now()}-${idx}`,
                title: text,
                completed: false
            })),
            userId,
        };

        return NextResponse.json({ success: true, policy }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[POST /api/generate]', message);

        // Surface Gemini-specific errors clearly
        if (message.includes('GEMINI_API_KEY')) {
            return NextResponse.json(
                { error: 'Gemini API key is not configured. Set GEMINI_API_KEY in your environment.' },
                { status: 503 }
            );
        }
        if (message.includes('Gemini') || message === 'Provide at least a policy text, description, or PDF') {
            return NextResponse.json({ error: message }, { status: 400 });
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
