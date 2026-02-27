import { NextRequest, NextResponse } from 'next/server';
import { generatePolicy } from '@/lib/ai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, input_text, userId } = body;

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
        if (!input_text || typeof input_text !== 'string' || input_text.trim() === '') {
            return NextResponse.json(
                { error: 'input_text is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // 1. Generate structured output via Gemini
        const generated = await generatePolicy(input_text.trim());

        // 2. Return formatted policy object
        const policy = {
            title: title.trim(),
            input_text: input_text.trim(),
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
        if (message.includes('Gemini')) {
            return NextResponse.json({ error: message }, { status: 502 });
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
