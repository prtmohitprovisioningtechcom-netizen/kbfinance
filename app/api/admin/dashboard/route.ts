import { NextResponse } from 'next/server';
import pool, { ensureContactTable } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureAuthTables, dbErrorMessage } from '@/lib/auth-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAuthTables().catch(() => {});
    await ensureContactTable().catch(() => {});

    // Fetch Total Customers
    let totalCustomers = 0;
    try {
      const [customersResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM customers');
      totalCustomers = customersResult[0]?.count || 0;
    } catch (e) {
      console.warn('Dashboard customers count warning:', e);
    }

    // Fetch Pending Applications
    let pendingApps = 0;
    let recentApps: any[] = [];
    try {
      const [appsResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM loan_applications WHERE status IN ("NEW", "UNDER_REVIEW")');
      pendingApps = appsResult[0]?.count || 0;

      const [recentAppsRows] = await pool.execute<RowDataPacket[]>(
        'SELECT l.id, u.name as user, l.service_type as action_type, "submitted a new loan application" as action, l.created_at, l.status FROM loan_applications l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 3'
      );
      recentApps = recentAppsRows;
    } catch (e) {
      console.warn('Dashboard loan applications warning:', e);
    }

    // Fetch New Enquiries
    let newEnquiries = 0;
    let recentEnquiries: any[] = [];
    try {
      const [enquiriesResult] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM contact_inquiries WHERE status = "NEW"');
      newEnquiries = enquiriesResult[0]?.count || 0;

      const [recentEnquiriesRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, name as user, service_required as action_type, "submitted a new enquiry" as action, created_at, status FROM contact_inquiries ORDER BY created_at DESC LIMIT 3'
      );
      recentEnquiries = recentEnquiriesRows;
    } catch (e) {
      console.warn('Dashboard enquiries warning:', e);
    }

    // Combine and sort by date descending
    const activity = [...recentEnquiries, ...recentApps]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(item => ({
        id: item.id + '-' + item.action_type,
        user: item.user || 'Unknown',
        action: item.action + ' for ' + (item.action_type || 'General Inquiry'),
        time: item.created_at,
        status: (item.status || 'NEW').toLowerCase()
      }));

    return NextResponse.json({
      stats: {
        totalCustomers,
        pendingApps,
        newEnquiries,
      },
      activity
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: dbErrorMessage(error) }, { status: 500 });
  }
}
