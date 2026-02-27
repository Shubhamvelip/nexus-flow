import { NextRequest, NextResponse } from 'next/server';
import { generatePolicy } from '@/lib/ai';
import { createPolicy } from '@/lib/firebase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, input_text } = body;

        // Validate input
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json(
                { error: 'title is required and must be a non-empty string' },
                { status: 400 }
            );
        }
        if (!input_text || typeof input_text !== 'string' || input_text.trim() === '') {
            return NextResponse.json(
                { error: 'input_text is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // 1. Generate structured output via Gemini
        const generated = await generatePolicy(input_text.trim());

        // 2. Save to Firestore
        const policy = await createPolicy({
            title: title.trim(),
            input_text: input_text.trim(),
            workflow: generated.workflow,
            decision_tree: generated.decision_tree,
            checklist: generated.checklist,
        });

        return NextResponse.json({ success: true, policy }, { status: 201 });
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
        if (message.includes('Gemini')) {
            return NextResponse.json({ error: message }, { status: 502 });
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
