import { NextRequest, NextResponse } from 'next/server';
import { getPolicyById } from '@/lib/firebase';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
        }

        const policy = await getPolicyById(id);

        if (!policy) {
            return NextResponse.json({ error: `Policy with ID "${id}" not found` }, { status: 404 });
        }

        return NextResponse.json({ success: true, policy }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[GET /api/policies/[id]]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
