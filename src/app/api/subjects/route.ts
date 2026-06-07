import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-static';

export async function GET() {
    try {
        if (!process.env.MONGODB_URI) {
            return NextResponse.json({});
        }
        const { db } = await connectToDatabase();
        const subjects = await db.collection('subjects').find({}).toArray();
        const subjectMap: Record<string, any> = {};
        subjects.forEach(s => {
            const { _id, ...rest } = s;
            subjectMap[s.id || _id.toString()] = rest;
        });
        return NextResponse.json(subjectMap);
    } catch (error: any) {
        console.error('[API GET subjects] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch subjects from MongoDB Atlas' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { subjectId, subject } = await request.json();
        if (!subjectId || !subject) {
            return NextResponse.json({ error: 'Missing subjectId or subject' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        // Remove MongoDB internal _id if it's passed inside subject payload to prevent immutable _id update error
        const { _id, ...cleanSubject } = subject;
        
        await db.collection('subjects').updateOne(
            { id: subjectId },
            { $set: cleanSubject },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API POST subjects] Error:', error);
        return NextResponse.json({ error: 'Failed to write subject to MongoDB Atlas: ' + (error.message || error) }, { status: 500 });
    }
}
