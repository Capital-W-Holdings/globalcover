-- GlobalCover Database Schema
-- This script initializes the PostgreSQL database with all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'lead_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 7),
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    start_date VARCHAR(20) NOT NULL,
    message TEXT,
    referral_code VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Waitlist entries table
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'wl_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 7),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    interests TEXT[] NOT NULL DEFAULT '{}',
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    referred_by VARCHAR(20),
    position INTEGER NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_entries(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist_entries(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlist_entries(position);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'pay_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 7),
    stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Members table (for subscription management)
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'mem_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 7),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),
    plan_type VARCHAR(20) CHECK (plan_type IN ('monthly', 'annual')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
    referral_code VARCHAR(20) UNIQUE,
    referred_by VARCHAR(64),
    subscription_start TIMESTAMP WITH TIME ZONE,
    subscription_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for members
CREATE INDEX IF NOT EXISTS idx_members_email ON members(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_members_stripe_customer ON members(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON waitlist_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO globalcover_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO globalcover_app;

-- Initial data: Insert starting waitlist position
-- This ensures new waitlist entries start from a believable number
INSERT INTO waitlist_entries (id, email, first_name, interests, referral_code, position, verified)
VALUES ('wl_seed', 'system@globalcover.internal', 'System', '{}', 'SYSTEM000', 2500, true)
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE leads IS 'Quote request leads from insurance product pages';
COMMENT ON TABLE waitlist_entries IS 'Pre-launch waitlist with referral tracking';
COMMENT ON TABLE payments IS 'Stripe payment transactions';
COMMENT ON TABLE members IS 'Active membership subscriptions';
