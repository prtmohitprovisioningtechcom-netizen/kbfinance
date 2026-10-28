import { NextResponse } from 'next/server';
import pool, { ensureContactTable } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbErrorMessage } from '@/lib/auth-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureContactTable().catch((err) => {
      console.warn('Could not auto-create contact_inquiries table in enquiries API:', err);
    });

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, name, phone, email, city, service_required, message, status, created_at 
       FROM contact_inquiries 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ enquiries: rows });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ error: dbErrorMessage(error) }, { status: 500 });
  }
}
