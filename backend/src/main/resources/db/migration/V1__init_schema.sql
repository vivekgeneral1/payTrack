CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    default_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    timezone        VARCHAR(64) NOT NULL DEFAULT 'UTC',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    device_info     VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    icon            VARCHAR(64),
    color           VARCHAR(16),
    is_system       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, name)
);

CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id             UUID REFERENCES categories(id) ON DELETE SET NULL,
    provider_name           VARCHAR(255) NOT NULL,
    plan_name               VARCHAR(255),
    cost                    NUMERIC(14,2) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'INR',
    billing_cycle           VARCHAR(16) NOT NULL DEFAULT 'MONTHLY',
    custom_interval_days    INTEGER,
    start_date              DATE NOT NULL,
    next_renewal_date       DATE NOT NULL,
    status                  VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    auto_renew              BOOLEAN NOT NULL DEFAULT true,
    cancellation_url        VARCHAR(500),
    cancellation_instructions TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_user_renewal ON subscriptions(user_id, next_renewal_date);

CREATE TABLE subscription_cancellations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cancelled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_date  DATE,
    reason          VARCHAR(500),
    refund_amount   NUMERIC(14,2),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sub_cancellations_sub ON subscription_cancellations(subscription_id);

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    amount          NUMERIC(14,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'INR',
    due_date        DATE NOT NULL,
    paid_date       DATE,
    status          VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    is_recurring    BOOLEAN NOT NULL DEFAULT false,
    recurrence_rule VARCHAR(64),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_user_due ON payments(user_id, due_date);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id      UUID REFERENCES payments(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    file_object_key VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    size_bytes      BIGINT NOT NULL,
    invoice_number  VARCHAR(100),
    invoice_date    DATE,
    amount          NUMERIC(14,2),
    vendor_name     VARCHAR(255),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_payment ON invoices(payment_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);

CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(32) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    body                TEXT,
    related_entity_type VARCHAR(32),
    related_entity_id   UUID,
    channel             VARCHAR(16) NOT NULL DEFAULT 'IN_APP',
    is_read             BOOLEAN NOT NULL DEFAULT false,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

CREATE TABLE reminder_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     VARCHAR(32) NOT NULL,
    entity_id       UUID NOT NULL,
    offset_days     INTEGER NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (entity_type, entity_id, offset_days)
);

CREATE TABLE razorpay_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id          UUID REFERENCES payments(id) ON DELETE SET NULL,
    subscription_id     UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    razorpay_order_id   VARCHAR(100) NOT NULL UNIQUE,
    amount              NUMERIC(14,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    status              VARCHAR(16) NOT NULL DEFAULT 'CREATED',
    receipt             VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_razorpay_orders_user ON razorpay_orders(user_id);

CREATE TABLE razorpay_webhook_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razorpay_event_id   VARCHAR(100) NOT NULL UNIQUE,
    event_type          VARCHAR(100) NOT NULL,
    raw_payload         JSONB NOT NULL,
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE razorpay_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razorpay_order_id   UUID NOT NULL REFERENCES razorpay_orders(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR(100) NOT NULL UNIQUE,
    status              VARCHAR(16) NOT NULL,
    method              VARCHAR(32),
    amount              NUMERIC(14,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    raw_payload         JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE google_calendar_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    access_token    TEXT NOT NULL,
    refresh_token   TEXT NOT NULL,
    scope           VARCHAR(500),
    token_expiry    TIMESTAMPTZ NOT NULL,
    calendar_id     VARCHAR(255) NOT NULL DEFAULT 'primary',
    connected_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE google_calendar_event_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type     VARCHAR(32) NOT NULL,
    entity_id       UUID NOT NULL,
    google_event_id VARCHAR(255) NOT NULL,
    calendar_id     VARCHAR(255) NOT NULL DEFAULT 'primary',
    last_synced_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (entity_type, entity_id)
);

CREATE TABLE budgets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
    period              VARCHAR(16) NOT NULL DEFAULT 'MONTHLY',
    limit_amount        NUMERIC(14,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    alert_threshold_pct INTEGER NOT NULL DEFAULT 80,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_budgets_user ON budgets(user_id);

-- Seed a handful of system-wide default categories (user_id NULL => visible to all users)
INSERT INTO categories (id, user_id, name, icon, color, is_system) VALUES
    (gen_random_uuid(), NULL, 'Subscriptions', 'repeat', '#8b5cf6', true),
    (gen_random_uuid(), NULL, 'Utilities', 'zap', '#f59e0b', true),
    (gen_random_uuid(), NULL, 'Rent & Housing', 'home', '#06b6d4', true),
    (gen_random_uuid(), NULL, 'Insurance', 'shield', '#10b981', true),
    (gen_random_uuid(), NULL, 'Loans & EMI', 'credit-card', '#ef4444', true),
    (gen_random_uuid(), NULL, 'Entertainment', 'film', '#ec4899', true),
    (gen_random_uuid(), NULL, 'Other', 'more-horizontal', '#6b7280', true);
