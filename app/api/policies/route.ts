import { NextResponse } from 'next/server';
import { getPolicies } from '@/lib/firebase';

export async function GET() {
    try {
        const policies = await getPolicies();
        return NextResponse.json({ success: true, policies }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[GET /api/policies]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
