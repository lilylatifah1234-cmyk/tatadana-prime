-- ═══════════════════════════════════════════════════════════════════════════════
-- TATADANA PRIME — ENTERPRISE DATABASE SCHEMA & ROW LEVEL SECURITY
-- PostgreSQL 15+ (Supabase Enterprise)
-- Timezone: Asia/Jakarta (WIB, UTC+7)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USER IDENTITY
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_whatsapp TEXT, -- E.164 Format e.g. +6281234567890
    session_token TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'superadmin')),
    default_currency TEXT NOT NULL DEFAULT 'IDR' CHECK (default_currency IN ('IDR', 'USD', 'SGD')),
    telegram_chat_id BIGINT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 2. MULTI-LEDGER WALLETS
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. 'BCA Prioritas', 'Mandiri Bisnis', 'Kas Tunai'
    type TEXT NOT NULL DEFAULT 'bank' CHECK (type IN ('bank', 'cash', 'ewallet', 'investment', 'foreign_currency')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 3. CATEGORIES & BUDGET CAPS
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    icon_emoji TEXT NOT NULL DEFAULT '🏷️',
    color_hex TEXT NOT NULL DEFAULT '#FF5F1F',
    monthly_budget_cap NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 4. TRANSACTIONS CORE
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    to_wallet_id UUID REFERENCES wallets(id) ON DELETE RESTRICT, -- Required if type = 'transfer'
    admin_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    note TEXT,
    source TEXT NOT NULL DEFAULT 'web_manual' CHECK (source IN ('telegram_text', 'telegram_voice', 'telegram_receipt', 'web_manual', 'recurring_auto')),
    receipt_image_url TEXT,
    tx_timestamp TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 5. TRANSACTION ITEMS (MULTI-ITEM RECEIPT BREAKDOWN)
CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 6. MONTHLY BUDGETS & THRESHOLD TRACKING
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    period_month VARCHAR(7) NOT NULL, -- Format 'YYYY-MM', e.g. '2026-10'
    cap_amount NUMERIC(15, 2) NOT NULL CHECK (cap_amount >= 0),
    alert_80_sent BOOLEAN NOT NULL DEFAULT FALSE,
    alert_100_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    UNIQUE(user_id, category_id, period_month)
);

-- 7. TELEGRAM INBOX IDEMPOTENCY LOG
CREATE TABLE IF NOT EXISTS telegram_inbox_logs (
    update_id BIGINT PRIMARY KEY, -- Idempotency Key dari Telegram Network
    chat_id BIGINT NOT NULL,
    message_id BIGINT,
    raw_payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'duplicate', 'failed')),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 8. TELEGRAM BOT USER CONFIGURATIONS
CREATE TABLE IF NOT EXISTS telegram_bot_configs (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    bot_token_encrypted TEXT NOT NULL, -- Enkripsi AES-256-GCM
    bot_username TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    webhook_verified_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 9. USER SUBSCRIPTIONS & QUOTA TRACKER
CREATE TABLE IF NOT EXISTS subscriptions (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'starter' CHECK (plan_type IN ('starter', 'pro', 'lifetime')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
    monthly_tx_count INT NOT NULL DEFAULT 0,
    tx_quota INT NOT NULL DEFAULT 75, -- 75 untuk Starter, -1 (unlimited) untuk Pro & Lifetime
    expired_at TIMESTAMPTZ,
    reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta' + INTERVAL '1 month')
);

-- 10. PAYMENT ORDERS & MANUAL SETTLEMENT DESK
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL UNIQUE,
    gross_amount NUMERIC(15, 2) NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'pro', 'lifetime')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('midtrans_snap', 'manual_transfer')),
    snap_token TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'settlement', 'expire', 'cancel', 'rejected')),
    proof_image_url TEXT,
    verified_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 11. AI AUDIT LOGS & LATENCY MONITOR
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'deepseek', 'fallback')),
    model TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('text_parse', 'voice_transcribe', 'vision_receipt', 'wealth_advisor')),
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    estimated_cost_usd NUMERIC(10, 6) DEFAULT 0.000000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 12. ADMIN SECURITY AUDIT TRAIL
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    reason TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ATOMIC LEDGER BALANCE TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_wallet_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'expense') THEN
            UPDATE wallets 
            SET balance = balance - NEW.amount, updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'income') THEN
            UPDATE wallets 
            SET balance = balance + NEW.amount, updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'transfer') THEN
            -- Deduct from origin wallet (amount + admin fee)
            UPDATE wallets 
            SET balance = balance - (NEW.amount + COALESCE(NEW.admin_fee, 0)), updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE id = NEW.wallet_id;
            -- Add to target wallet
            IF (NEW.to_wallet_id IS NOT NULL) THEN
                UPDATE wallets 
                SET balance = balance + NEW.amount, updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
                WHERE id = NEW.to_wallet_id;
            END IF;
        END IF;
        
        -- Increment monthly transaction count for quota tracking
        UPDATE subscriptions 
        SET monthly_tx_count = monthly_tx_count + 1
        WHERE user_id = NEW.user_id;
        
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
        IF (OLD.type = 'expense') THEN
            UPDATE wallets 
            SET balance = balance + OLD.amount, updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'income') THEN
            UPDATE wallets 
            SET balance = balance - OLD.amount, updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'transfer') THEN
            UPDATE wallets 
            SET balance = balance + (OLD.amount + COALESCE(OLD.admin_fee, 0)), updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE id = OLD.wallet_id;
            IF (OLD.to_wallet_id IS NOT NULL) THEN
                UPDATE wallets 
                SET balance = balance - OLD.amount, updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
                WHERE id = OLD.to_wallet_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_wallet_balance ON transactions;
CREATE TRIGGER trg_update_wallet_balance
AFTER INSERT OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance_on_transaction();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: User can read and update own profile. Superadmins can read all.
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Wallets
CREATE POLICY "Users manage own wallets" ON wallets FOR ALL USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users manage own categories" ON categories FOR ALL USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Transaction Items: Accessible if user owns the parent transaction
CREATE POLICY "Users manage transaction items" ON transaction_items FOR ALL USING (
    EXISTS (SELECT 1 FROM transactions WHERE transactions.id = transaction_items.transaction_id AND transactions.user_id = auth.uid())
);

-- Budgets
CREATE POLICY "Users manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Payment Orders
CREATE POLICY "Users manage own payments" ON payment_orders FOR ALL USING (auth.uid() = user_id);

-- AI Audit Logs
CREATE POLICY "Users view own ai logs" ON ai_audit_logs FOR SELECT USING (auth.uid() = user_id);
