-- Clothing ecommerce database
-- Guest checkout + optional customer accounts
-- Supabase is the authoritative database

create extension if not exists "pgcrypto";

-- =========================================================
-- PROFILES
-- Only used for optional customer accounts and admins.
-- Guest customers do not need a profile.
-- =========================================================

create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    phone text,
    role text not null default 'customer'
        check (role in ('customer', 'admin')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================================
-- CATEGORIES
-- =========================================================

create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    description text,
    image_url text,
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================================
-- PRODUCTS
-- =========================================================

create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references categories(id) on delete set null,

    name text not null,
    slug text not null unique,
    description text,

    brand text,

    base_price numeric(10,2) not null
        check (base_price >= 0),

    sale_price numeric(10,2)
        check (sale_price is null or sale_price >= 0),

    main_image_url text,

    is_featured boolean not null default false,
    is_active boolean not null default true,

    rating_avg numeric(3,2) not null default 0
        check (rating_avg between 0 and 5),

    rating_count integer not null default 0
        check (rating_count >= 0),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_products_category
on products(category_id);

create index if not exists idx_products_active
on products(is_active);

create index if not exists idx_products_featured
on products(is_featured);

-- =========================================================
-- PRODUCT VARIANTS
-- Every size/color combination gets its own SKU.
-- =========================================================

create table if not exists product_variants (
    id uuid primary key default gen_random_uuid(),

    product_id uuid not null
        references products(id) on delete cascade,

    sku text not null unique,

    size text,
    color text,

    price numeric(10,2),

    image_url text,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_variants_product
on product_variants(product_id);

-- =========================================================
-- INVENTORY
-- =========================================================

create table if not exists inventory (
    id uuid primary key default gen_random_uuid(),

    variant_id uuid not null unique
        references product_variants(id) on delete cascade,

    quantity integer not null default 0
        check (quantity >= 0),

    low_stock_threshold integer not null default 5
        check (low_stock_threshold >= 0),

    updated_at timestamptz not null default now()
);

-- =========================================================
-- ADDRESSES
-- Can be used for guest checkout or logged-in customers.
-- =========================================================

create table if not exists addresses (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references profiles(id) on delete set null,

    full_name text not null,
    email text not null,
    phone text not null,

    address_line1 text not null,
    address_line2 text,

    city text not null,
    state text not null,
    postal_code text not null,
    country text not null default 'India',

    created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user
on addresses(user_id);

-- =========================================================
-- CARTS
-- Guest carts use session_id.
-- Logged-in customers can additionally use user_id.
-- =========================================================

create table if not exists carts (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references profiles(id) on delete cascade,

    session_id text unique,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    check (user_id is not null or session_id is not null)
);

create unique index if not exists idx_carts_user_unique
on carts(user_id)
where user_id is not null;

-- =========================================================
-- CART ITEMS
-- =========================================================

create table if not exists cart_items (
    id uuid primary key default gen_random_uuid(),

    cart_id uuid not null
        references carts(id) on delete cascade,

    variant_id uuid not null
        references product_variants(id) on delete cascade,

    quantity integer not null
        check (quantity > 0),

    created_at timestamptz not null default now(),

    unique(cart_id, variant_id)
);

create index if not exists idx_cart_items_cart
on cart_items(cart_id);

-- =========================================================
-- ORDERS
-- Guest orders do not require user_id.
-- =========================================================

create table if not exists orders (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references profiles(id) on delete set null,

    order_number text not null unique,

    customer_name text not null,
    customer_email text not null,
    customer_phone text not null,

    address_line1 text not null,
    address_line2 text,
    city text not null,
    state text not null,
    postal_code text not null,
    country text not null default 'India',

    subtotal numeric(10,2) not null default 0
        check (subtotal >= 0),

    discount numeric(10,2) not null default 0
        check (discount >= 0),

    shipping_fee numeric(10,2) not null default 0
        check (shipping_fee >= 0),

    total_amount numeric(10,2) not null default 0
        check (total_amount >= 0),

    status text not null default 'pending'
        check (
            status in (
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'returned'
            )
        ),

    payment_status text not null default 'pending'
        check (
            payment_status in (
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        ),

    tracking_number text,

    invoice_number text unique,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user
on orders(user_id);

create index if not exists idx_orders_status
on orders(status);

create index if not exists idx_orders_email
on orders(customer_email);

create index if not exists idx_orders_created
on orders(created_at);

-- =========================================================
-- ORDER ITEMS
-- Snapshot product information at purchase time.
-- =========================================================

create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),

    order_id uuid not null
        references orders(id) on delete cascade,

    variant_id uuid
        references product_variants(id) on delete set null,

    product_name text not null,
    variant_name text,
    sku text,

    quantity integer not null
        check (quantity > 0),

    unit_price numeric(10,2) not null
        check (unit_price >= 0),

    total_price numeric(10,2) not null
        check (total_price >= 0),

    created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order
on order_items(order_id);

-- =========================================================
-- PAYMENTS
-- Razorpay records.
-- =========================================================

create table if not exists payments (
    id uuid primary key default gen_random_uuid(),

    order_id uuid not null unique
        references orders(id) on delete cascade,

    provider text not null default 'razorpay',

    provider_order_id text unique,
    provider_payment_id text unique,

    amount numeric(10,2) not null
        check (amount >= 0),

    currency text not null default 'INR',

    status text not null default 'created'
        check (
            status in (
                'created',
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        ),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_payments_order
on payments(order_id);

create index if not exists idx_payments_provider_order
on payments(provider_order_id);

-- =========================================================
-- COUPONS
-- =========================================================

create table if not exists coupons (
    id uuid primary key default gen_random_uuid(),

    code text not null unique,

    description text,

    discount_type text not null
        check (discount_type in ('percentage', 'fixed')),

    discount_value numeric(10,2) not null
        check (discount_value >= 0),

    minimum_order_amount numeric(10,2) not null default 0
        check (minimum_order_amount >= 0),

    usage_limit integer,

    used_count integer not null default 0
        check (used_count >= 0),

    expires_at timestamptz,

    is_active boolean not null default true,

    created_at timestamptz not null default now()
);

-- =========================================================
-- REVIEWS
-- =========================================================

create table if not exists reviews (
    id uuid primary key default gen_random_uuid(),

    product_id uuid not null
        references products(id) on delete cascade,

    user_id uuid references profiles(id) on delete set null,

    customer_email text,

    rating integer not null
        check (rating between 1 and 5),

    title text,

    comment text,

    created_at timestamptz not null default now(),

    unique(product_id, user_id, customer_email)
);

create index if not exists idx_reviews_product
on reviews(product_id);

-- =========================================================
-- EMAIL OTP VERIFICATIONS
-- OTP is only for checkout verification.
-- =========================================================

create table if not exists email_otp_verifications (
    id uuid primary key default gen_random_uuid(),

    email text not null,

    otp_hash text not null,

    purpose text not null default 'checkout'
        check (purpose in ('checkout', 'account')),

    expires_at timestamptz not null,

    attempts integer not null default 0
        check (attempts >= 0),

    verified_at timestamptz,

    created_at timestamptz not null default now()
);

create index if not exists idx_email_otp_email
on email_otp_verifications(email);

-- =========================================================
-- INVOICES
-- =========================================================

create table if not exists invoices (
    id uuid primary key default gen_random_uuid(),

    order_id uuid not null unique
        references orders(id) on delete cascade,

    invoice_number text not null unique,

    pdf_url text,

    created_at timestamptz not null default now()
);

-- =========================================================
-- OPTIONAL CUSTOMER ACCOUNT SESSION RECORD
-- The authenticated session itself is managed by Supabase Auth.
-- This table records account metadata only.
-- =========================================================

create table if not exists customer_accounts (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null unique
        references profiles(id) on delete cascade,

    last_login_at timestamptz,

    created_at timestamptz not null default now()
);

-- =========================================================
-- ADMIN CHECK
-- Uses SECURITY DEFINER to avoid RLS recursion.
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
    );
$$;

-- =========================================================
-- UPDATED_AT HELPER
-- =========================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
before update on profiles
for each row execute function public.handle_updated_at();

drop trigger if exists categories_updated_at on categories;
create trigger categories_updated_at
before update on categories
for each row execute function public.handle_updated_at();

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
before update on products
for each row execute function public.handle_updated_at();

drop trigger if exists product_variants_updated_at on product_variants;
create trigger product_variants_updated_at
before update on product_variants
for each row execute function public.handle_updated_at();

drop trigger if exists inventory_updated_at on inventory;
create trigger inventory_updated_at
before update on inventory
for each row execute function public.handle_updated_at();

drop trigger if exists carts_updated_at on carts;
create trigger carts_updated_at
before update on carts
for each row execute function public.handle_updated_at();

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
before update on orders
for each row execute function public.handle_updated_at();

drop trigger if exists payments_updated_at on payments;
create trigger payments_updated_at
before update on payments
for each row execute function public.handle_updated_at();

-- =========================================================
-- PRODUCT RATING TRIGGER
-- =========================================================

create or replace function public.update_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    target_product uuid;
begin
    target_product := coalesce(new.product_id, old.product_id);

    update products
    set
        rating_avg = coalesce(
            (
                select round(avg(rating)::numeric, 2)
                from reviews
                where product_id = target_product
            ),
            0
        ),
        rating_count = (
            select count(*)
            from reviews
            where product_id = target_product
        )
    where id = target_product;

    return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_rating_update on reviews;
create trigger reviews_rating_update
after insert or update or delete on reviews
for each row execute function public.update_product_rating();

-- =========================================================
-- PROFILE CREATION FOR OPTIONAL ACCOUNTS
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        phone
    )
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', ''),
        coalesce(new.raw_user_meta_data ->> 'phone', '')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table inventory enable row level security;
alter table addresses enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table coupons enable row level security;
alter table reviews enable row level security;
alter table email_otp_verifications enable row level security;
alter table invoices enable row level security;
alter table customer_accounts enable row level security;

-- =========================================================
-- PUBLIC PRODUCT ACCESS
-- =========================================================

create policy "Public can read active categories"
on categories
for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active products"
on products
for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active variants"
on product_variants
for select
to anon, authenticated
using (is_active = true);

create policy "Public can read inventory"
on inventory
for select
to anon, authenticated
using (true);

create policy "Public can read reviews"
on reviews
for select
to anon, authenticated
using (true);

-- =========================================================
-- ADMIN PRODUCT MANAGEMENT
-- =========================================================

create policy "Admins manage categories"
on categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage products"
on products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage variants"
on product_variants
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage inventory"
on inventory
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage coupons"
on coupons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- PROFILE POLICIES
-- =========================================================

create policy "Users can read own profile"
on profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can read all profiles"
on profiles
for select
to authenticated
using (public.is_admin());

-- =========================================================
-- ADDRESS POLICIES
-- =========================================================

create policy "Users manage own addresses"
on addresses
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins read all addresses"
on addresses
for select
to authenticated
using (public.is_admin());

-- =========================================================
-- CART POLICIES
-- =========================================================

create policy "Users manage own carts"
on carts
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage own cart items"
on cart_items
for all
to authenticated
using (
    exists (
        select 1
        from carts c
        where c.id = cart_items.cart_id
          and c.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from carts c
        where c.id = cart_items.cart_id
          and c.user_id = auth.uid()
    )
);

-- =========================================================
-- ORDER POLICIES
-- Guest orders are created by secure server-side code.
-- Customers can only read their own authenticated orders.
-- =========================================================

create policy "Users can read own orders"
on orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins manage orders"
on orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read own order items"
on order_items
for select
to authenticated
using (
    exists (
        select 1
        from orders o
        where o.id = order_items.order_id
          and o.user_id = auth.uid()
    )
);

create policy "Admins manage order items"
on order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- PAYMENT POLICIES
-- =========================================================

create policy "Users can read own payments"
on payments
for select
to authenticated
using (
    exists (
        select 1
        from orders o
        where o.id = payments.order_id
          and o.user_id = auth.uid()
    )
);

create policy "Admins manage payments"
on payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- REVIEW POLICIES
-- =========================================================

create policy "Users can create reviews"
on reviews
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own reviews"
on reviews
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own reviews"
on reviews
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Admins manage reviews"
on reviews
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- INVOICE POLICIES
-- =========================================================

create policy "Users can read own invoices"
on invoices
for select
to authenticated
using (
    exists (
        select 1
        from orders o
        where o.id = invoices.order_id
          and o.user_id = auth.uid()
    )
);

create policy "Admins manage invoices"
on invoices
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- OPTIONAL ACCOUNT METADATA
-- =========================================================

create policy "Users manage own customer account"
on customer_accounts
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins read customer accounts"
on customer_accounts
for select
to authenticated
using (public.is_admin());

-- =========================================================
-- OTP TABLE
-- Server-side code should use the service role.
-- No public access policies are intentionally created.
-- =========================================================

-- =========================================================
-- INVOICE NUMBER HELPER
-- =========================================================

create or replace function public.generate_invoice_number()
returns text
language plpgsql
as $$
begin
    return 'INV-' ||
        to_char(now(), 'YYYYMMDD') ||
        '-' ||
        upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
end;
$$;