const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

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

async function initializeDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'kb_finance';
  const port = Number(process.env.DB_PORT || 3306);

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  try {
    // 1. Connect without database to create the database if not exists
    const rootConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    console.log(`Connected! Creating database \`${database}\` if not exists...`);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();
    console.log(`Database \`${database}\` is ready.`);

    // 2. Connect to the specific database
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    console.log('Creating tables...');

    // Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'USER',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log(' - users table ready');

    // Customers table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log(' - customers table ready');

    // Contact Inquiries table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        city VARCHAR(100),
        service_required VARCHAR(255),
        message TEXT,
        status ENUM('NEW', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'NEW',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log(' - contact_inquiries table ready');

    // Loan Applications table
    await conn.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log(' - loan_applications table ready');

    // Services table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        bullets JSON,
        buttonText VARCHAR(255),
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log(' - services table ready');

    // Settings table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log(' - settings table ready');

    // 3. Seed Default Admin User
    const adminEmail = 'financeserviceskb@gmail.com';
    const adminPass = 'financekb@321';
    const [adminRows] = await conn.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);

    if (adminRows.length === 0) {
      const hashed = await bcrypt.hash(adminPass, 10);
      await conn.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['KB Admin', adminEmail, hashed, 'ADMIN']
      );
      console.log(` - Admin user created: ${adminEmail}`);
    } else {
      console.log(` - Admin user already exists: ${adminEmail}`);
    }

    // 4. Seed Services
    const [serviceCountRows] = await conn.query('SELECT COUNT(*) as count FROM services');
    if (serviceCountRows[0].count === 0) {
      for (const svc of initialServices) {
        await conn.query(
          `INSERT INTO services (id, title, subtitle, bullets, buttonText, image) VALUES (?, ?, ?, ?, ?, ?)`,
          [svc.id, svc.title, svc.subtitle, JSON.stringify(svc.bullets), svc.buttonText, svc.image]
        );
      }
      console.log(` - Seeded 8 services successfully.`);
    } else {
      console.log(` - Services table already has ${serviceCountRows[0].count} entries.`);
    }

    // 5. Verify all tables in kb_finance
    const [tables] = await conn.query('SHOW TABLES;');
    console.log('\n=======================================');
    console.log(`SUCCESS! Database '${database}' is fully configured.`);
    console.log('Tables present in database:');
    tables.forEach((t) => console.log(' ->', Object.values(t)[0]));
    console.log('=======================================\n');

    await conn.end();
  } catch (err) {
    console.error('Database setup error:', err);
    process.exit(1);
  }
}

initializeDatabase();
