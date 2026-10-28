import { NextResponse } from 'next/server';
import pool, { ensureContactTable } from '@/lib/db';
import { ensureAuthTables, ensureDefaultAdmin } from '@/lib/auth-db';

export const dynamic = 'force-dynamic';

const initialServices = [
  {
    id: "personal",
    title: "Personal Loan",
    subtitle: "Quick and easy personal loans for your immediate needs.",
    bullets: ["No collateral required", "Fast approval process", "Flexible repayment terms"],
    buttonText: "Apply for Personal Loan",
    image: "/images/personal-loan.jpg"
  },
  {
    id: "business",
    title: "Business Loan",
    subtitle: "Fuel your business growth with our tailored business loans.",
    bullets: ["Working capital finance", "Machinery loan", "Expansion funds"],
    buttonText: "Apply for Business Loan",
    image: "/images/business-loan.jpg"
  },
  {
    id: "home",
    title: "Home Loan",
    subtitle: "Fulfill your dream of owning a home with attractive interest rates.",
    bullets: ["Low interest rates", "Long repayment tenure", "Easy documentation"],
    buttonText: "Apply for Home Loan",
    image: "/images/service-loans.jpg"
  },
  {
    id: "lap",
    title: "Loan Against Property",
    subtitle: "Unlock the value of your property to meet large financial needs.",
    bullets: ["High loan amount", "Lower interest rates", "Residential or commercial"],
    buttonText: "Apply for LAP",
    image: "/images/service-insurance.jpg"
  },
  {
    id: "fd",
    title: "Fixed Deposit (FD)",
    subtitle: "Secure your savings and earn guaranteed returns over time.",
    bullets: ["High interest rates", "Flexible tenure", "Safe and secure"],
    buttonText: "Open an FD Today",
    image: "/images/service-investment.jpg"
  },
  {
    id: "rd",
    title: "Recurring Deposit (RD)",
    subtitle: "Build a corpus systematically with small monthly savings.",
    bullets: ["Save regularly", "Attractive returns", "Inculcates savings habit"],
    buttonText: "Start an RD",
    image: "/images/hero-2.jpg"
  },
  {
    id: "msme",
    title: "MSME Loan",
    subtitle: "Specialized financial support for Micro, Small and Medium Enterprises.",
    bullets: ["Collateral-free options", "Government scheme support", "Quick processing"],
    buttonText: "Apply for MSME Loan",
    image: "/images/hero-3.jpg"
  },
  {
    id: "credit",
    title: "Credit Card",
    subtitle: "Enjoy financial flexibility and rewards with our premium credit cards.",
    bullets: ["Cashback & rewards", "Lounge access", "Interest-free period"],
    buttonText: "Apply for Credit Card",
    image: "/images/service-tax.jpg"
  }
];

export async function GET() {
  try {
    // 1. Create users and customers tables and default admin
    try {
      await ensureAuthTables();
      await ensureDefaultAdmin();
    } catch (authErr) {
      console.warn('Auth tables setup warning:', authErr);
    }

    // 2. Create contact_inquiries table
    await ensureContactTable();

    // 3. Create loan_applications table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS loan_applications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          service_type VARCHAR(255) NOT NULL,
          loan_amount DECIMAL(15, 2) NOT NULL,
          employment_type VARCHAR(100),
          status ENUM('NEW', 'UNDER_REVIEW', 'DOCUMENTATION', 'PROCESSING', 'COMPLETED', 'REJECTED') DEFAULT 'NEW',
          message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    } catch (loanErr) {
      console.warn('Loan applications table setup warning:', loanErr);
    }

    // 4. Create settings table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value TEXT
        )
      `);
    } catch (settingsErr) {
      console.warn('Settings table setup warning:', settingsErr);
    }

    // 5. Create services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        bullets JSON,
        buttonText VARCHAR(255),
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Check if table is empty and seed
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM services');
    let seeded = false;
    
    if ((rows as any)[0].count === 0) {
      for (const svc of initialServices) {
        await pool.query(
          `INSERT INTO services (id, title, subtitle, bullets, buttonText, image) VALUES (?, ?, ?, ?, ?, ?)`,
          [svc.id, svc.title, svc.subtitle, JSON.stringify(svc.bullets), svc.buttonText, svc.image]
        );
      }
      seeded = true;
    }

    return NextResponse.json({
      success: true,
      message: seeded
        ? "All database tables (users, customers, contact_inquiries, loan_applications, settings, services) created and seeded successfully!"
        : "All database tables verified and up-to-date."
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Failed to setup database', details: error?.message || error }, { status: 500 });
  }
}
