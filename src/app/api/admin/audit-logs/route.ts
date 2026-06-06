import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-static';

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const logs = await db.collection('admin-audit')
            .find({})
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        const formattedLogs = logs.map(l => {
            const { _id, ...rest } = l;
            return { id: _id.toString(), ...rest };
        });
        return NextResponse.json(formattedLogs);
    } catch (error: any) {
        console.error('[API GET audit-logs] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const log = await request.json();
        if (!log || !log.adminEmail || !log.action || !log.details) {
            return NextResponse.json({ error: 'Missing required audit log parameters' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const result = await db.collection('admin-audit').insertOne(log);
        return NextResponse.json({ success: true, id: result.insertedId.toString() });
    } catch (error: any) {
        console.error('[API POST audit-logs] Error:', error);
        return NextResponse.json({ error: 'Failed to write audit log to MongoDB Atlas' }, { status: 500 });
    }
}
