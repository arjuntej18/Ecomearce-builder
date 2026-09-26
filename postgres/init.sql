BEGIN;

-- ============================================================
-- SEETHA VASTRAM
-- Oracle-compatible PostgreSQL application database
--
-- PostgreSQL = single source of truth
-- Supabase = Admin Authentication / Sessions only
--
-- No:
--   auth.users
--   auth.uid()
--   Supabase RLS
--   Supabase policies
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE profiles (
    id uuid PRIMARY KEY,
    full_name text,
    phone text,
    role text NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin')),
    created_at timestamptz DEFAULT now()
);


-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),

    CONSTRAINT categories_name_key UNIQUE (name),
    CONSTRAINT categories_slug_key UNIQUE (slug)
);


-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    brand text,
    base_price numeric NOT NULL
        CHECK (base_price >= 0),
    sale_price numeric
        CHECK (sale_price >= 0),
    main_image_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_featured boolean NOT NULL DEFAULT false,

    CONSTRAINT products_slug_key UNIQUE (slug),

    CONSTRAINT products_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);


-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================

CREATE TABLE product_variants (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid NOT NULL,
    size text,
    color text,
    sku text NOT NULL,
    price numeric,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    original_price numeric,
    discount_percent numeric DEFAULT 0,

    CONSTRAINT product_variants_sku_key UNIQUE (sku),

    CONSTRAINT product_variants_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);


-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL,
    image_url text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT product_images_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);


-- ============================================================
-- INVENTORY
-- ============================================================

CREATE TABLE inventory (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id uuid NOT NULL,
    quantity integer NOT NULL DEFAULT 0
        CHECK (quantity >= 0),
    updated_at timestamptz DEFAULT now(),
    low_stock_threshold integer NOT NULL DEFAULT 5
        CHECK (low_stock_threshold >= 0),

    CONSTRAINT inventory_variant_id_key UNIQUE (variant_id),

    CONSTRAINT inventory_variant_id_fkey
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CARTS
-- ============================================================

CREATE TABLE carts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid,
    session_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT carts_session_id_key UNIQUE (session_id),
    CONSTRAINT carts_user_id_key UNIQUE (user_id),

    CONSTRAINT carts_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CART ITEMS
-- ============================================================

CREATE TABLE cart_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id uuid NOT NULL,
    variant_id uuid NOT NULL,
    quantity integer NOT NULL
        CHECK (quantity > 0),
    created_at timestamptz DEFAULT now(),

    CONSTRAINT cart_items_cart_id_variant_id_key
        UNIQUE (cart_id, variant_id),

    CONSTRAINT cart_items_cart_id_fkey
        FOREIGN KEY (cart_id)
        REFERENCES carts(id)
        ON DELETE CASCADE,

    CONSTRAINT cart_items_variant_id_fkey
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CUSTOMER ACCOUNTS
-- ============================================================

CREATE TABLE customer_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT customer_accounts_user_id_key UNIQUE (user_id),

    CONSTRAINT customer_accounts_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
);


-- ============================================================
-- EMAIL OTP VERIFICATIONS
-- ============================================================

CREATE TABLE email_otp_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    otp_hash text NOT NULL,
    purpose text NOT NULL DEFAULT 'checkout'
        CHECK (purpose IN ('checkout', 'account')),
    expires_at timestamptz NOT NULL,
    attempts integer NOT NULL DEFAULT 0,
    verified_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- ADDRESSES
-- ============================================================

CREATE TABLE addresses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL DEFAULT 'India',
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),

    CONSTRAINT addresses_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
);


-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid,
    address_id uuid,
    order_number text NOT NULL,
    subtotal numeric NOT NULL DEFAULT 0,
    discount numeric NOT NULL DEFAULT 0,
    shipping_fee numeric NOT NULL DEFAULT 0,
    total_amount numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'returned'
            )
        ),
    payment_status text NOT NULL DEFAULT 'pending'
        CHECK (
            payment_status IN (
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        ),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    customer_name text,
    customer_email text,
    customer_phone text,
    address_line1 text,
    address_line2 text,
    city text,
    state text,
    postal_code text,
    country text DEFAULT 'India',
    tracking_number text,
    invoice_number text,
    expected_delivery_date date,

    CONSTRAINT orders_invoice_number_key
        UNIQUE (invoice_number),

    CONSTRAINT orders_order_number_key
        UNIQUE (order_number),

    CONSTRAINT orders_address_id_fkey
        FOREIGN KEY (address_id)
        REFERENCES addresses(id)
        ON DELETE SET NULL,

    CONSTRAINT orders_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE SET NULL
);


-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id uuid NOT NULL,
    variant_id uuid,
    product_name text NOT NULL,
    variant_name text,
    sku text,
    quantity integer NOT NULL
        CHECK (quantity > 0),
    unit_price numeric NOT NULL,
    total_price numeric NOT NULL,
    created_at timestamptz DEFAULT now(),

    CONSTRAINT order_items_order_id_fkey
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT order_items_variant_id_fkey
        FOREIGN KEY (variant_id)
        REFERENCES product_variants(id)
        ON DELETE SET NULL
);


-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id uuid NOT NULL,
    provider text NOT NULL DEFAULT 'razorpay',
    provider_order_id text,
    provider_payment_id text,
    amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'INR',
    status text NOT NULL DEFAULT 'created'
        CHECK (
            status IN (
                'created',
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        ),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT payments_order_id_key
        UNIQUE (order_id),

    CONSTRAINT payments_order_id_fkey
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);


-- ============================================================
-- INVOICES
-- ============================================================

CREATE TABLE invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    invoice_number text NOT NULL,
    pdf_url text,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT invoices_invoice_number_key
        UNIQUE (invoice_number),

    CONSTRAINT invoices_order_id_key
        UNIQUE (order_id),

    CONSTRAINT invoices_order_id_fkey
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);


-- ============================================================
-- COUPONS
-- ============================================================

CREATE TABLE coupons (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    code text NOT NULL,
    description text,
    discount_type text NOT NULL
        CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value numeric NOT NULL
        CHECK (discount_value >= 0),
    minimum_order_amount numeric DEFAULT 0,
    usage_limit integer,
    used_count integer NOT NULL DEFAULT 0,
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),

    CONSTRAINT coupons_code_key UNIQUE (code)
);


-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL
        CHECK (rating >= 1 AND rating <= 5),
    title text,
    comment text,
    created_at timestamptz DEFAULT now(),

    CONSTRAINT reviews_product_id_user_id_key
        UNIQUE (product_id, user_id),

    CONSTRAINT reviews_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT reviews_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE
);


-- ============================================================
-- STORE SETTINGS
-- ============================================================

CREATE TABLE store_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_days integer NOT NULL DEFAULT 7,
    updated_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_addresses_user
    ON addresses(user_id);


CREATE INDEX idx_email_otp_email_purpose
    ON email_otp_verifications(email, purpose);

CREATE INDEX idx_email_otp_expires
    ON email_otp_verifications(expires_at);

CREATE INDEX idx_inventory_low_stock
    ON inventory(quantity, low_stock_threshold);

CREATE INDEX idx_inventory_variant
    ON inventory(variant_id);

CREATE INDEX idx_invoices_order
    ON invoices(order_id);

CREATE INDEX idx_order_items_order
    ON order_items(order_id);

CREATE INDEX idx_orders_created_at
    ON orders(created_at);

CREATE INDEX idx_orders_customer_email
    ON orders(customer_email);

CREATE INDEX idx_orders_status
    ON orders(status);

CREATE INDEX idx_orders_tracking_number
    ON orders(tracking_number);

CREATE INDEX idx_orders_user
    ON orders(user_id);

CREATE INDEX idx_variants_product
    ON product_variants(product_id);

CREATE INDEX idx_products_category
    ON products(category_id);

CREATE INDEX idx_products_featured
    ON products(is_featured);

CREATE INDEX idx_reviews_product
    ON reviews(product_id);


-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


-- ============================================================
-- LIVE SCHEMA TRIGGER
-- Only product_variants currently has this trigger.
-- ============================================================

CREATE TRIGGER product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();


-- ============================================================
-- PAYMENT COMPLETION TRANSACTION
-- ============================================================

CREATE OR REPLACE FUNCTION complete_paid_order(
    p_order_id uuid,
    p_payment_id uuid,
    p_provider_payment_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    order_record record;
    item_record record;
    inventory_record record;
BEGIN

    -- Lock the order so the payment cannot be
    -- processed twice at the same time.
    SELECT id, payment_status
    INTO order_record
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Order not found.'
        );
    END IF;


    -- Already completed.
    IF order_record.payment_status = 'paid' THEN
        RETURN jsonb_build_object(
            'success', true,
            'already_processed', true
        );
    END IF;


    -- Check stock for every item first.
    FOR item_record IN
        SELECT variant_id, quantity
        FROM order_items
        WHERE order_id = p_order_id
    LOOP

        SELECT variant_id, quantity
        INTO inventory_record
        FROM inventory
        WHERE variant_id = item_record.variant_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Inventory record not found.'
            );
        END IF;

        IF inventory_record.quantity < item_record.quantity THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient stock for one or more items.'
            );
        END IF;

    END LOOP;


    -- Reduce stock.
    FOR item_record IN
        SELECT variant_id, quantity
        FROM order_items
        WHERE order_id = p_order_id
    LOOP

        UPDATE inventory
        SET quantity = quantity - item_record.quantity
        WHERE variant_id = item_record.variant_id;

    END LOOP;


    -- Mark payment as paid.
    UPDATE payments
    SET
        provider_payment_id = p_provider_payment_id,
        status = 'paid'
    WHERE id = p_payment_id;


    -- Mark order as confirmed and paid.
    UPDATE orders
    SET
        payment_status = 'paid',
        status = 'confirmed',
        updated_at = now()
    WHERE id = p_order_id;


    RETURN jsonb_build_object(
        'success', true,
        'inventory_updated', true
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;


COMMIT;