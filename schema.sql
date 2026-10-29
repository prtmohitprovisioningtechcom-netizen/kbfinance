CREATE DATABASE IF NOT EXISTS kb_finance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kb_finance;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Contact Inquiries Table
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

-- 4. Loan Applications Table
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

-- 5. Services Table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    bullets JSON,
    buttonText VARCHAR(255),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Default Admin User (Password: financekb@321)
INSERT INTO users (name, email, password, role)
VALUES ('KB Admin', 'financeserviceskb@gmail.com', '$2b$10$tZzCvy6Rsl2t2f3tO1hYEu63wXWk0uR9o.oN5GjR7sK8J0vJ8H24i', 'ADMIN')
ON DUPLICATE KEY UPDATE role = 'ADMIN';

-- 8. Seed Services
INSERT INTO services (id, title, subtitle, bullets, buttonText, image) VALUES
('personal', 'Personal Loan', 'Quick and easy personal loans for your immediate needs.', '["No collateral required", "Fast approval process", "Flexible repayment terms"]', 'Apply for Personal Loan', '/images/personal-loan.jpg'),
('business', 'Business Loan', 'Fuel your business growth with our tailored business loans.', '["Working capital finance", "Machinery loan", "Expansion funds"]', 'Apply for Business Loan', '/images/business-loan.jpg'),
('home', 'Home Loan', 'Fulfill your dream of owning a home with attractive interest rates.', '["Low interest rates", "Long repayment tenure", "Easy documentation"]', 'Apply for Home Loan', '/images/service-loans.jpg'),
('lap', 'Loan Against Property', 'Unlock the value of your property to meet large financial needs.', '["High loan amount", "Lower interest rates", "Residential or commercial"]', 'Apply for LAP', '/images/service-insurance.jpg'),
('fd', 'Fixed Deposit (FD)', 'Secure your savings and earn guaranteed returns over time.', '["High interest rates", "Flexible tenure", "Safe and secure"]', 'Open an FD Today', '/images/service-investment.jpg'),
('rd', 'Recurring Deposit (RD)', 'Build a corpus systematically with small monthly savings.', '["Save regularly", "Attractive returns", "Inculcates savings habit"]', 'Start an RD', '/images/hero-2.jpg'),
('msme', 'MSME Loan', 'Specialized financial support for Micro, Small and Medium Enterprises.', '["Collateral-free options", "Government scheme support", "Quick processing"]', 'Apply for MSME Loan', '/images/hero-3.jpg'),
('credit', 'Credit Card', 'Enjoy financial flexibility and rewards with our premium credit cards.', '["Cashback & rewards", "Lounge access", "Interest-free period"]', 'Apply for Credit Card', '/images/service-tax.jpg')
ON DUPLICATE KEY UPDATE title=VALUES(title);
