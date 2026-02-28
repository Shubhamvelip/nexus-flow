import { NextRequest, NextResponse } from 'next/server';
import { getPolicies, createPolicy } from '@/lib/firebase';

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const policies = await getPolicies(userId);
        return NextResponse.json({ success: true, policies }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[GET /api/policies]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, input_text, workflow, decision_tree, checklist, rules, graph, userId } = body;

        // Validation
        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json({ error: 'title is required and must be a non-empty string' }, { status: 400 });
        }
        if (!workflow || !decision_tree || !checklist) {
            return NextResponse.json({ error: 'workflow, decision_tree, and checklist are required' }, { status: 400 });
        }

        const policy = await createPolicy({
            title: title.trim(),
            input_text: input_text ? input_text.trim() : "",
            workflow,
            decision_tree,
            checklist,
            rules: Array.isArray(rules) ? rules : [],
            graph: graph ?? null,
            userId,
        });

        return NextResponse.json({ success: true, policy }, { status: 201 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[POST /api/policies]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
