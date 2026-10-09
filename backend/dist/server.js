"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_1 = __importDefault(require("fastify"));
const pg_1 = require("pg");
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
const auth_1 = require("./auth");
const auth_service_1 = require("./auth-service");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const fastify_raw_body_1 = __importDefault(require("fastify-raw-body"));
const session_service_1 = require("./session-service");
const app = (0, fastify_1.default)({
    logger: true,
});
app.register(fastify_raw_body_1.default, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
});
app.register(cors_1.default, {
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    credentials: true,
});
const serverPort = Number(process.env.PORT ?? 4000);
const db = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const redis = new ioredis_1.default(process.env.REDIS_URL ?? "redis://redis:6379");
app.get("/health", async () => {
    return {
        status: "ok",
        service: "backend",
    };
});
app.get("/health/database", async () => {
    const result = await db.query("SELECT NOW() AS now");
    return {
        status: "ok",
        database: "postgresql",
        time: result.rows[0].now,
    };
});
app.get("/health/redis", async () => {
    const result = await redis.ping();
    return {
        status: result === "PONG" ? "ok" : "error",
        redis: result,
    };
});
app.get("/api/admin/auth/verify", async (request, reply) => {
    try {
        const authorization = request.headers.authorization ?? "";
        if (!authorization.startsWith("Bearer ")) {
            return reply.code(401).send({
                error: "Authentication required.",
            });
        }
        const accessToken = authorization.substring("Bearer ".length).trim();
        if (!accessToken) {
            return reply.code(401).send({
                error: "Authentication required.",
            });
        }
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl ||
            !supabaseServiceRoleKey) {
            return reply.code(500).send({
                error: "Supabase authentication is not configured.",
            });
        }
        const supabaseResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                apikey: supabaseServiceRoleKey,
            },
        });
        if (!supabaseResponse.ok) {
            return reply.code(401).send({
                error: "Invalid authentication.",
            });
        }
        const supabaseUser = (await supabaseResponse.json());
        const email = supabaseUser.email?.trim().toLowerCase();
        if (!email) {
            return reply.code(403).send({
                error: "Authenticated user has no email.",
            });
        }
        const result = await db.query(`
      SELECT
        id,
        email,
        role
      FROM profiles
      WHERE LOWER(email) = $1
        AND role = 'admin'
      LIMIT 1
      `, [email]);
        if (!result.rows.length) {
            return reply.code(403).send({
                error: "Admin access required.",
            });
        }
        return {
            authorized: true,
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                role: result.rows[0].role,
            },
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to verify admin access.",
        });
    }
});
const backgroundQueue = new bullmq_1.Queue("background", {
    connection: redis,
});
app.get("/api/categories", async () => {
    const result = await db.query(`
    SELECT
      id,
      name,
      slug
    FROM categories
    ORDER BY name ASC
  `);
    return {
        categories: result.rows,
    };
});
app.get("/api/admin/categories", async (request, reply) => {
    try {
        const result = await db.query(`
      SELECT
        id,
        name,
        slug,
        description,
        created_at
      FROM categories
      ORDER BY created_at DESC
    `);
        return {
            categories: result.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load categories.",
        });
    }
});
app.post("/api/admin/categories", async (request, reply) => {
    try {
        const body = request.body;
        const name = typeof body.name === "string"
            ? body.name.trim()
            : "";
        const slug = typeof body.slug === "string"
            ? body.slug.trim().toLowerCase()
            : "";
        const description = typeof body.description === "string"
            ? body.description.trim() || null
            : null;
        if (!name) {
            return reply.code(400).send({
                error: "Category name is required.",
            });
        }
        if (!slug) {
            return reply.code(400).send({
                error: "Category slug is required.",
            });
        }
        const existingCategory = await db.query(`
      SELECT id
      FROM categories
      WHERE slug = $1
      LIMIT 1
      `, [slug]);
        if (existingCategory.rows.length) {
            return reply.code(409).send({
                error: "A category with this slug already exists.",
            });
        }
        const result = await db.query(`
      INSERT INTO categories (
        name,
        slug,
        description
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        slug,
        description,
        created_at
      `, [name, slug, description]);
        return reply.code(201).send({
            category: result.rows[0],
        });
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to create category.",
        });
    }
});
app.delete("/api/admin/categories", async (request, reply) => {
    try {
        const body = request.body;
        const id = typeof body.id === "string"
            ? body.id.trim()
            : "";
        if (!id) {
            return reply.code(400).send({
                error: "Category ID is required.",
            });
        }
        const result = await db.query(`
      DELETE FROM categories
      WHERE id = $1
      RETURNING id
      `, [id]);
        if (!result.rows.length) {
            return reply.code(404).send({
                error: "Category not found.",
            });
        }
        return {
            success: true,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to delete category.",
        });
    }
});
app.get("/api/products", async (request) => {
    const { category } = request.query;
    const params = [];
    let categoryFilter = "";
    if (category) {
        params.push(category);
        categoryFilter = `
      AND p.category_id = (
        SELECT id
        FROM categories
        WHERE slug = $1
      )
    `;
    }
    const result = await db.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.main_image_url,
      p.category_id,
      p.created_at,
      (
  SELECT json_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug
  )
  FROM categories c
  WHERE c.id = p.category_id
) AS category,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', pv.id,
              'price', pv.price,
              'original_price', pv.original_price,
              'discount_percent', pv.discount_percent,
              'is_active', pv.is_active
            )
            ORDER BY pv.id
          )
          FROM product_variants pv
          WHERE pv.product_id = p.id
            AND pv.is_active = true
        ),
        '[]'::json
      ) AS product_variants,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'sort_order', pi.sort_order
            )
            ORDER BY pi.sort_order
          )
          FROM product_images pi
          WHERE pi.product_id = p.id
        ),
        '[]'::json
      ) AS product_images,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'variant_id', pv.id,
              'quantity', COALESCE(i.quantity, 0)
            )
            ORDER BY pv.id
          )
          FROM product_variants pv
          LEFT JOIN inventory i
            ON i.variant_id = pv.id
          WHERE pv.product_id = p.id
            AND pv.is_active = true
        ),
        '[]'::json
      ) AS inventory

    FROM products p

    WHERE p.is_active = true
    ${categoryFilter}

    ORDER BY p.created_at DESC
    `, params);
    return {
        products: result.rows,
    };
});
app.get("/api/products/:slug", async (request, reply) => {
    const { slug } = request.params;
    const productResult = await db.query(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.main_image_url,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'sort_order', pi.sort_order
            )
            ORDER BY pi.sort_order
          )
          FROM product_images pi
          WHERE pi.product_id = p.id
        ),
        '[]'::json
      ) AS product_images

    FROM products p

    WHERE p.slug = $1
      AND p.is_active = true

    LIMIT 1
    `, [slug]);
    const product = productResult.rows[0];
    if (!product) {
        return reply.code(404).send({
            error: "Product not found.",
        });
    }
    const variantsResult = await db.query(`
    SELECT
      id,
      sku,
      size,
      color,
      price,
      original_price,
      discount_percent,
      is_active
    FROM product_variants
    WHERE product_id = $1
      AND is_active = true
    ORDER BY size ASC, id ASC
    `, [product.id]);
    const inventoryResult = await db.query(`
    SELECT
      variant_id,
      quantity
    FROM inventory
    WHERE variant_id = ANY($1::uuid[])
    `, [
        variantsResult.rows.map((variant) => variant.id),
    ]);
    return {
        product,
        variants: variantsResult.rows,
        inventory: inventoryResult.rows,
    };
});
app.get("/api/auth/session", async (request, reply) => {
    try {
        const cookies = request.headers.cookie ?? "";
        const match = cookies
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("customer_session="));
        if (!match) {
            return reply.code(401).send({
                error: "Authentication required.",
            });
        }
        const sessionId = match.substring("customer_session=".length);
        const session = await (0, session_service_1.getSession)(sessionId);
        if (!session) {
            return reply.code(401).send({
                error: "Session expired.",
            });
        }
        return {
            authenticated: true,
            userId: session.userId,
            role: session.role,
            name: session.name,
            email: session.email,
            picture: session.picture,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to check session.",
        });
    }
});
app.post("/api/auth/google", async (request, reply) => {
    try {
        const { idToken } = request.body;
        if (!idToken) {
            return reply.code(400).send({
                error: "Google ID token is required.",
            });
        }
        const googleUser = await (0, auth_1.verifyGoogleToken)(idToken);
        const user = await (0, auth_service_1.findOrCreateGoogleUser)(db, googleUser);
        if (user.role !== "customer") {
            return reply.code(403).send({
                error: "Customer authentication required.",
            });
        }
        const sessionId = await (0, session_service_1.createSession)({
            userId: user.id,
            role: user.role,
            name: user.full_name,
            email: user.email,
            picture: user.profile_picture,
        });
        reply.header("Set-Cookie", `customer_session=${sessionId}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`);
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                picture: user.profile_picture,
                role: user.role,
            },
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(401).send({
            error: "Google authentication failed.",
        });
    }
});
app.get("/api/admin/products", async (request, reply) => {
    try {
        const productsResult = await db.query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.brand,
        p.category_id,
        c.name AS category_name,

        p.base_price,
        p.selling_price,
        p.discounted_price,

        p.main_image_url,
        p.is_active,
        p.is_featured,
        p.created_at,
        p.updated_at

      FROM products p

      LEFT JOIN categories c
        ON c.id = p.category_id

      ORDER BY p.created_at DESC
    `);
        const variantsResult = await db.query(`
      SELECT
        id,
        product_id,
        price,
        original_price,
        discount_percent,
        size,
        color,
        sku,
        is_active
      FROM product_variants
      ORDER BY created_at ASC
    `);
        const inventoryResult = await db.query(`
      SELECT
        id,
        variant_id,
        quantity
      FROM inventory
    `);
        const imagesResult = await db.query(`
      SELECT
        id,
        product_id,
        image_url,
        sort_order
      FROM product_images
      ORDER BY product_id, sort_order ASC
    `);
        const categoriesResult = await db.query(`
      SELECT
        id,
        name,
        slug
      FROM categories
      ORDER BY name ASC
    `);
        return {
            products: productsResult.rows,
            variants: variantsResult.rows,
            inventory: inventoryResult.rows,
            images: imagesResult.rows,
            categories: categoriesResult.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load products.",
        });
    }
});
app.patch("/api/admin/products/:id", async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    try {
        await db.query("BEGIN");
        /*
         * ---------------------------------------------------------
         * 1. Verify product exists
         * ---------------------------------------------------------
         */
        const productResult = await db.query(`
        SELECT
          id,
          base_price,
          selling_price,
          discounted_price
        FROM products
        WHERE id = $1
        FOR UPDATE
      `, [id]);
        if (!productResult.rows.length) {
            await db.query("ROLLBACK");
            return reply.code(404).send({
                error: "Product not found.",
            });
        }
        const currentProduct = productResult.rows[0];
        /*
         * ---------------------------------------------------------
         * 2. Determine final pricing values
         * ---------------------------------------------------------
         */
        let basePrice = body.base_price !== undefined
            ? Number(body.base_price)
            : Number(currentProduct.base_price);
        let sellingPrice = body.selling_price !== undefined
            ? Number(body.selling_price)
            : Number(currentProduct.selling_price);
        let discountedPrice = body.discounted_price !== undefined
            ? body.discounted_price === null
                ? null
                : Number(body.discounted_price)
            : currentProduct.discounted_price !== null
                ? Number(currentProduct.discounted_price)
                : null;
        /*
         * Base Price
         */
        if (!Number.isFinite(basePrice) ||
            basePrice < 0) {
            await db.query("ROLLBACK");
            return reply.code(400).send({
                error: "Base Price must be a valid non-negative number.",
            });
        }
        /*
         * Selling Price
         */
        if (!Number.isFinite(sellingPrice) ||
            sellingPrice < 0) {
            await db.query("ROLLBACK");
            return reply.code(400).send({
                error: "Selling Price must be a valid non-negative number.",
            });
        }
        /*
         * Discounted Price
         */
        if (discountedPrice !== null &&
            (!Number.isFinite(discountedPrice) ||
                discountedPrice < 0)) {
            await db.query("ROLLBACK");
            return reply.code(400).send({
                error: "Discounted Price must be a valid non-negative number.",
            });
        }
        /*
         * Discounted price must be lower
         * than Base Price.
         */
        if (discountedPrice !== null &&
            discountedPrice >= basePrice) {
            await db.query("ROLLBACK");
            return reply.code(400).send({
                error: "Discounted Price must be lower than Base Price.",
            });
        }
        /*
         * Calculate discount percentage.
         *
         * IMPORTANT:
         * Discount is ALWAYS calculated
         * from Base Price.
         */
        let discountPercent = null;
        if (discountedPrice !== null &&
            basePrice > 0) {
            discountPercent = Number((((basePrice -
                discountedPrice) /
                basePrice) *
                100).toFixed(2));
        }
        /*
         * ---------------------------------------------------------
         * 3. Update product information
         * ---------------------------------------------------------
         */
        const productUpdates = [];
        const productValues = [];
        function addProductField(column, value) {
            productValues.push(value);
            productUpdates.push(`${column} = $${productValues.length}`);
        }
        /*
         * Basic information
         */
        if (body.name !== undefined) {
            const name = body.name.trim();
            if (!name) {
                await db.query("ROLLBACK");
                return reply.code(400).send({
                    error: "Product name cannot be empty.",
                });
            }
            addProductField("name", name);
        }
        if (body.slug !== undefined) {
            const slug = body.slug.trim();
            if (!slug) {
                await db.query("ROLLBACK");
                return reply.code(400).send({
                    error: "Product slug cannot be empty.",
                });
            }
            addProductField("slug", slug);
        }
        if (body.description !==
            undefined) {
            addProductField("description", body.description);
        }
        if (body.brand !== undefined) {
            addProductField("brand", body.brand);
        }
        if (body.category_id !==
            undefined) {
            addProductField("category_id", body.category_id);
        }
        if (body.main_image_url !==
            undefined) {
            addProductField("main_image_url", body.main_image_url);
        }
        if (body.is_featured !==
            undefined) {
            addProductField("is_featured", body.is_featured);
        }
        if (body.is_active !==
            undefined) {
            addProductField("is_active", body.is_active);
        }
        /*
         * ---------------------------------------------------------
         * Pricing
         * ---------------------------------------------------------
         */
        addProductField("base_price", basePrice);
        addProductField("selling_price", sellingPrice);
        addProductField("discounted_price", discountedPrice);
        if (productUpdates.length) {
            productUpdates.push("updated_at = NOW()");
            productValues.push(id);
            await db.query(`
          UPDATE products
          SET
            ${productUpdates.join(", ")}
          WHERE id = $${productValues.length}
        `, productValues);
        }
        /*
         * ---------------------------------------------------------
         * 4. Update variant information
         * ---------------------------------------------------------
         */
        if (body.variants?.length) {
            for (const variant of body.variants) {
                /*
                 * New variants are not created
                 * here yet.
                 *
                 * Existing variants are updated.
                 */
                if (!variant.id) {
                    continue;
                }
                const updates = [];
                const values = [];
                function addVariantField(column, value) {
                    values.push(value);
                    updates.push(`${column} = $${values.length}`);
                }
                if (variant.sku !==
                    undefined) {
                    const sku = variant.sku.trim();
                    if (!sku) {
                        await db.query("ROLLBACK");
                        return reply.code(400).send({
                            error: "Variant SKU cannot be empty.",
                        });
                    }
                    addVariantField("sku", sku);
                }
                if (variant.size !==
                    undefined) {
                    addVariantField("size", variant.size);
                }
                if (variant.color !==
                    undefined) {
                    addVariantField("color", variant.color);
                }
                /*
                 * Variant price is kept as the
                 * actual final customer price.
                 *
                 * We synchronize it with:
                 *
                 * discounted price
                 * OR
                 * selling price
                 */
                if (variant.price !==
                    undefined) {
                    const variantPrice = variant.price === null
                        ? null
                        : Number(variant.price);
                    if (variantPrice !== null &&
                        (!Number.isFinite(variantPrice) ||
                            variantPrice < 0)) {
                        await db.query("ROLLBACK");
                        return reply.code(400).send({
                            error: "Variant price is invalid.",
                        });
                    }
                    addVariantField("price", variantPrice);
                }
                if (variant.is_active !==
                    undefined) {
                    addVariantField("is_active", variant.is_active);
                }
                /*
                 * Keep variant discount metadata
                 * synchronized with product pricing.
                 */
                addVariantField("original_price", basePrice);
                addVariantField("discount_percent", discountPercent);
                /*
                 * If no explicit variant price
                 * was supplied, use the product's
                 * final customer price.
                 */
                if (variant.price ===
                    undefined) {
                    const finalPrice = discountedPrice !==
                        null
                        ? discountedPrice
                        : sellingPrice;
                    addVariantField("price", finalPrice);
                }
                if (!updates.length) {
                    continue;
                }
                values.push(variant.id);
                values.push(id);
                await db.query(`
            UPDATE product_variants
            SET
              ${updates.join(", ")},
              updated_at = NOW()
            WHERE id = $${values.length - 1}
              AND product_id = $${values.length}
          `, values);
            }
        }
        /*
         * ---------------------------------------------------------
         * 5. Update inventory
         * ---------------------------------------------------------
         */
        if (body.inventory?.length) {
            for (const item of body.inventory) {
                const quantity = Number(item.quantity);
                if (!Number.isInteger(quantity) ||
                    quantity < 0) {
                    await db.query("ROLLBACK");
                    return reply.code(400).send({
                        error: "Inventory quantity must be a non-negative integer.",
                    });
                }
                const result = await db.query(`
              UPDATE inventory i
              SET
                quantity = $1
              FROM product_variants pv
              WHERE
                i.variant_id = pv.id
                AND i.variant_id = $2
                AND pv.product_id = $3
              RETURNING
                i.id,
                i.variant_id,
                i.quantity
            `, [
                    quantity,
                    item.variant_id,
                    id,
                ]);
                if (!result.rows.length) {
                    await db.query("ROLLBACK");
                    return reply.code(400).send({
                        error: "Inventory record not found for this product.",
                    });
                }
            }
        }
        /*
         * ---------------------------------------------------------
         * 6. Read final product state
         * ---------------------------------------------------------
         */
        const finalProductResult = await db.query(`
          SELECT
            p.id,
            p.name,
            p.slug,
            p.description,
            p.brand,
            p.category_id,
            c.name AS category_name,

            p.base_price,
            p.selling_price,
            p.discounted_price,

            p.main_image_url,
            p.is_active,
            p.is_featured,
            p.created_at,
            p.updated_at

          FROM products p

          LEFT JOIN categories c
            ON c.id = p.category_id

          WHERE p.id = $1
        `, [id]);
        const finalVariantsResult = await db.query(`
          SELECT
            id,
            product_id,
            price,
            original_price,
            discount_percent,
            size,
            color,
            sku,
            is_active
          FROM product_variants
          WHERE product_id = $1
          ORDER BY created_at ASC
        `, [id]);
        const finalInventoryResult = await db.query(`
          SELECT
            id,
            variant_id,
            quantity
          FROM inventory
          WHERE variant_id IN (
            SELECT id
            FROM product_variants
            WHERE product_id = $1
          )
        `, [id]);
        await db.query("COMMIT");
        return {
            success: true,
            product: finalProductResult.rows[0],
            variants: finalVariantsResult.rows,
            inventory: finalInventoryResult.rows,
        };
    }
    catch (error) {
        await db.query("ROLLBACK");
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to update product.",
        });
    }
});
app.delete("/api/admin/products/:id", async (request, reply) => {
    const { id } = request.params;
    try {
        const result = await db.query(`
      DELETE FROM products
      WHERE id = $1
      RETURNING id
      `, [id]);
        if (!result.rowCount) {
            return reply.code(404).send({
                error: "Product not found.",
            });
        }
        return {
            success: true,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to delete product.",
        });
    }
});
app.post("/api/coupons/validate", async (request, reply) => {
    try {
        const { code, sessionId = null, variantId = null, quantity = 1, } = request.body;
        if (!code || typeof code !== "string") {
            return reply.code(400).send({
                error: "Coupon code is required.",
            });
        }
        const normalizedCode = code.trim().toUpperCase();
        let subtotal = 0;
        // Buy Now
        if (variantId) {
            const result = await db.query(`
        SELECT price, is_active
        FROM product_variants
        WHERE id = $1
          AND is_active = true
        `, [variantId]);
            const variant = result.rows[0];
            if (!variant) {
                return reply.code(404).send({
                    error: "Selected product not found.",
                });
            }
            const price = Number(variant.price);
            const qty = Math.max(1, Number(quantity));
            if (!Number.isFinite(price) || price <= 0) {
                return reply.code(400).send({
                    error: "Invalid product price.",
                });
            }
            subtotal = price * qty;
        }
        // Normal cart
        else {
            if (!sessionId) {
                return reply.code(400).send({
                    error: "Cart session is required.",
                });
            }
            const cartResult = await db.query(`
        SELECT id
        FROM carts
        WHERE session_id = $1
        `, [sessionId]);
            const cart = cartResult.rows[0];
            if (!cart) {
                return reply.code(404).send({
                    error: "Cart not found.",
                });
            }
            const itemsResult = await db.query(`
        SELECT
          ci.quantity,
          pv.price,
          pv.is_active
        FROM cart_items ci
        JOIN product_variants pv
          ON pv.id = ci.variant_id
        WHERE ci.cart_id = $1
        `, [cart.id]);
            if (!itemsResult.rows.length) {
                return reply.code(400).send({
                    error: "Cart is empty.",
                });
            }
            for (const item of itemsResult.rows) {
                if (!item.is_active) {
                    return reply.code(400).send({
                        error: "Cart contains an invalid product.",
                    });
                }
                const price = Number(item.price);
                const qty = Number(item.quantity);
                if (!Number.isFinite(price) ||
                    price <= 0 ||
                    !Number.isFinite(qty) ||
                    qty <= 0) {
                    return reply.code(400).send({
                        error: "Cart contains invalid pricing or quantity.",
                    });
                }
                subtotal += price * qty;
            }
        }
        const couponResult = await db.query(`
      SELECT
        id,
        code,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        usage_limit,
        used_count,
        expires_at,
        is_active
      FROM coupons
      WHERE UPPER(code) = $1
      LIMIT 1
      `, [normalizedCode]);
        const coupon = couponResult.rows[0];
        if (!coupon) {
            return reply.code(400).send({
                error: "Invalid coupon code.",
            });
        }
        if (!coupon.is_active) {
            return reply.code(400).send({
                error: "This coupon is inactive.",
            });
        }
        if (coupon.expires_at &&
            new Date(coupon.expires_at).getTime() <= Date.now()) {
            return reply.code(400).send({
                error: "This coupon has expired.",
            });
        }
        if (coupon.usage_limit !== null &&
            Number(coupon.used_count) >=
                Number(coupon.usage_limit)) {
            return reply.code(400).send({
                error: "This coupon has reached its usage limit.",
            });
        }
        if (coupon.minimum_order_amount !== null &&
            subtotal < Number(coupon.minimum_order_amount)) {
            return reply.code(400).send({
                error: `Minimum order value is ₹${Number(coupon.minimum_order_amount).toFixed(2)}.`,
            });
        }
        let discount = 0;
        if (coupon.discount_type === "percentage") {
            discount =
                subtotal *
                    (Number(coupon.discount_value) / 100);
        }
        else if (coupon.discount_type === "fixed") {
            discount = Number(coupon.discount_value);
        }
        else {
            return reply.code(400).send({
                error: "Invalid coupon type.",
            });
        }
        discount = Math.min(Math.max(0, discount), subtotal);
        const total = subtotal - discount;
        if (total <= 0) {
            return reply.code(400).send({
                error: "Coupon cannot make the order total zero.",
            });
        }
        return {
            valid: true,
            code: coupon.code,
            description: coupon.description,
            subtotal,
            discount,
            total,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to validate coupon.",
        });
    }
});
app.get("/api/admin/coupons", async (request, reply) => {
    try {
        const result = await db.query(`
      SELECT
        id,
        code,
        discount_type,
        discount_value,
        usage_limit,
        used_count,
        expires_at,
        is_active
      FROM coupons
      ORDER BY created_at DESC
    `);
        return {
            coupons: result.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load coupons.",
        });
    }
});
app.post("/api/admin/coupons", async (request, reply) => {
    try {
        const body = request.body;
        const normalizedCode = String(body.code ?? "")
            .trim()
            .toUpperCase();
        const discountType = body.discount_type ?? "percentage";
        const discountValue = Number(body.discount_value);
        const usageLimit = body.usage_limit === null ||
            body.usage_limit === undefined
            ? null
            : Number(body.usage_limit);
        if (!normalizedCode) {
            return reply.code(400).send({
                error: "Coupon code is required.",
            });
        }
        if (!Number.isFinite(discountValue) ||
            discountValue <= 0) {
            return reply.code(400).send({
                error: "Enter a valid discount.",
            });
        }
        if (discountType === "percentage" &&
            discountValue > 100) {
            return reply.code(400).send({
                error: "Percentage discount cannot exceed 100%.",
            });
        }
        if (usageLimit !== null &&
            (!Number.isInteger(usageLimit) ||
                usageLimit <= 0)) {
            return reply.code(400).send({
                error: "Usage limit must be a positive whole number.",
            });
        }
        const existing = await db.query(`
      SELECT id
      FROM coupons
      WHERE UPPER(code) = $1
      LIMIT 1
      `, [normalizedCode]);
        if (existing.rows.length) {
            return reply.code(409).send({
                error: "A coupon with this code already exists.",
            });
        }
        const result = await db.query(`
      INSERT INTO coupons (
        code,
        description,
        discount_type,
        discount_value,
        minimum_order_amount,
        usage_limit,
        used_count,
        expires_at,
        is_active
      )
      VALUES (
        $1,
        NULL,
        $2,
        $3,
        NULL,
        $4,
        0,
        $5,
        true
      )
      RETURNING
        id,
        code,
        discount_type,
        discount_value,
        usage_limit,
        used_count,
        expires_at,
        is_active
      `, [
            normalizedCode,
            discountType,
            discountValue,
            usageLimit,
            body.expires_at || null,
        ]);
        return {
            success: true,
            coupon: result.rows[0],
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to create coupon.",
        });
    }
});
app.patch("/api/admin/coupons", async (request, reply) => {
    try {
        const body = request.body;
        if (!body.id) {
            return reply.code(400).send({
                error: "Coupon ID is required.",
            });
        }
        const result = await db.query(`
      UPDATE coupons
      SET is_active = $1
      WHERE id = $2
      RETURNING
        id,
        code,
        discount_type,
        discount_value,
        usage_limit,
        used_count,
        expires_at,
        is_active
      `, [
            Boolean(body.is_active),
            body.id,
        ]);
        if (!result.rows.length) {
            return reply.code(404).send({
                error: "Coupon not found.",
            });
        }
        return {
            success: true,
            coupon: result.rows[0],
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to update coupon.",
        });
    }
});
app.get("/api/admin/customers", async (request, reply) => {
    try {
        const result = await db.query(`
      SELECT
        id,
        full_name,
        email,
        phone,
        created_at,
        last_login AS last_login_at
      FROM profiles
      WHERE role = 'customer'
      ORDER BY created_at DESC
    `);
        return {
            customers: result.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load customers.",
        });
    }
});
app.get("/api/inventory/:variantId", async (request, reply) => {
    try {
        const { variantId } = request.params;
        if (!variantId) {
            return reply.code(400).send({
                error: "Variant ID is required.",
            });
        }
        const result = await db.query(`
      SELECT
        pv.id AS variant_id,
        COALESCE(i.quantity, 0) AS quantity
      FROM product_variants pv
      LEFT JOIN inventory i
        ON i.variant_id = pv.id
      WHERE pv.id = $1
        AND pv.is_active = true
      LIMIT 1
      `, [variantId]);
        if (!result.rows.length) {
            return reply.code(404).send({
                error: "Product variant not found.",
            });
        }
        return {
            variantId: result.rows[0].variant_id,
            quantity: Number(result.rows[0].quantity),
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load stock.",
        });
    }
});
app.patch("/api/admin/inventory", async (request, reply) => {
    try {
        const body = request.body;
        const variantId = body.variantId;
        const quantity = Number(body.quantity);
        if (!variantId) {
            return reply.code(400).send({
                error: "Variant ID is required.",
            });
        }
        if (!Number.isInteger(quantity) ||
            quantity < 0) {
            return reply.code(400).send({
                error: "Stock quantity must be a whole number greater than or equal to zero.",
            });
        }
        const variantResult = await db.query(`
      SELECT id
      FROM product_variants
      WHERE id = $1
      `, [variantId]);
        if (!variantResult.rows.length) {
            return reply.code(404).send({
                error: "Product variant not found.",
            });
        }
        const result = await db.query(`
      INSERT INTO inventory (
        variant_id,
        quantity,
        low_stock_threshold
      )
      VALUES ($1, $2, 5)
      ON CONFLICT (variant_id)
      DO UPDATE SET
        quantity = EXCLUDED.quantity,
        updated_at = now()
      RETURNING
        variant_id,
        quantity
      `, [variantId, quantity]);
        return {
            success: true,
            variantId: result.rows[0].variant_id,
            quantity: result.rows[0].quantity,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to update inventory.",
        });
    }
});
app.get("/api/admin/dashboard", async (request, reply) => {
    try {
        const [productsResult, ordersResult, paidOrdersResult, customersResult, inventoryResult, pendingOrdersResult, chartOrdersResult,] = await Promise.all([
            db.query(`
        SELECT COUNT(*)::int AS count
        FROM products
      `),
            db.query(`
        SELECT COUNT(*)::int AS count
        FROM orders
      `),
            db.query(`
        SELECT COUNT(*)::int AS count
        FROM orders
        WHERE payment_status = 'paid'
      `),
            db.query(`
        SELECT COUNT(*)::int AS count
        FROM profiles
        WHERE role = 'customer'
      `),
            db.query(`
        SELECT COUNT(*)::int AS count
        FROM inventory
      `),
            db.query(`
        SELECT COUNT(*)::int AS count
        FROM orders
        WHERE status <> 'delivered'
      `),
            db.query(`
        SELECT
          id,
          created_at,
          total_amount,
          payment_status,
          status
        FROM orders
        ORDER BY created_at ASC
      `),
        ]);
        return {
            products: productsResult.rows[0]?.count ?? 0,
            orders: ordersResult.rows[0]?.count ?? 0,
            paidOrders: paidOrdersResult.rows[0]?.count ?? 0,
            customers: customersResult.rows[0]?.count ?? 0,
            inventoryItems: inventoryResult.rows[0]?.count ?? 0,
            pendingOrders: pendingOrdersResult.rows[0]?.count ?? 0,
            chartOrders: chartOrdersResult.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load dashboard data.",
        });
    }
});
app.get("/api/admin/order-notifications", async (request, reply) => {
    try {
        const { since } = request.query;
        const values = [];
        let sinceCondition = "";
        if (since) {
            values.push(since);
            sinceCondition = `AND created_at > $1`;
        }
        const result = await db.query(`
      SELECT
        id,
        order_number,
        customer_name,
        total_amount,
        created_at
      FROM orders
      WHERE payment_status = 'paid'
      ${sinceCondition}
      ORDER BY created_at ASC
      `, values);
        return {
            orders: result.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load order notifications.",
        });
    }
});
app.get("/api/admin/orders", async (request, reply) => {
    try {
        const result = await db.query(`
      SELECT
        id,
        order_number,
        customer_name,
        customer_email,
        total_amount,
        status,
        payment_status,
        created_at,
        latitude,
        longitude,
        location_accuracy,
        location_shared_at
      FROM orders
      ORDER BY created_at DESC
    `);
        return {
            orders: result.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load admin orders.",
        });
    }
});
app.get("/api/account/orders/:userId", async (request, reply) => {
    try {
        const cookies = request.headers.cookie ?? "";
        const match = cookies
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("customer_session="));
        if (!match) {
            return reply.code(401).send({
                error: "Authentication required.",
            });
        }
        const sessionId = match.substring("customer_session=".length);
        const session = await (0, session_service_1.getSession)(sessionId);
        if (!session) {
            return reply.code(401).send({
                error: "Session expired.",
            });
        }
        const result = await db.query(`
  SELECT
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    COALESCE(
      STRING_AGG(oi.product_name, ', ' ORDER BY oi.created_at),
      'Order'
    ) AS product_names
  FROM orders o
  LEFT JOIN order_items oi
    ON oi.order_id = o.id
  WHERE o.user_id = $1
    AND o.payment_status = 'paid'
  GROUP BY
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at
  ORDER BY o.created_at DESC
  `, [session.userId]);
        return {
            orders: result.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load orders.",
        });
    }
});
app.post("/api/auth/logout", async (request, reply) => {
    try {
        const cookies = request.headers.cookie ?? "";
        const match = cookies
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("customer_session="));
        if (match) {
            const sessionId = match.substring("customer_session=".length);
            await (0, session_service_1.deleteSession)(sessionId);
        }
        reply.header("Set-Cookie", "customer_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
        return {
            success: true,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to logout.",
        });
    }
});
app.post("/dev/test-job", async () => {
    const job = await backgroundQueue.add("test", {
        message: "Queue connection works",
        createdAt: new Date().toISOString(),
    });
    return {
        status: "queued",
        jobId: job.id,
    };
});
app.get("/api/admin/orders/:id", async (request, reply) => {
    try {
        const { id } = request.params;
        if (!id) {
            return reply.code(400).send({
                error: "Order ID is required.",
            });
        }
        const orderResult = await db.query(`
        SELECT
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          subtotal,
          discount,
          shipping_fee,
          total_amount,
          status,
          payment_status,
          tracking_number,
          invoice_number,
          created_at,
          updated_at,
          latitude,
          longitude,
          location_accuracy,
          location_shared_at
        FROM orders
        WHERE id = $1
        LIMIT 1
        `, [id]);
        const order = orderResult.rows[0];
        if (!order) {
            return reply.code(404).send({
                error: "Order not found.",
            });
        }
        const itemsResult = await db.query(`
        SELECT
          id,
          order_id,
          variant_id,
          product_name,
          variant_name,
          sku,
          quantity,
          unit_price,
          total_price,
          created_at
        FROM order_items
        WHERE order_id = $1
        ORDER BY created_at ASC
        `, [id]);
        return {
            order,
            items: itemsResult.rows,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load order details.",
        });
    }
});
app.patch("/api/admin/orders/:id", async (request, reply) => {
    try {
        const { id } = request.params;
        const body = request.body;
        const status = typeof body.status === "string"
            ? body.status.trim().toLowerCase()
            : "";
        const allowedStatuses = [
            "pending",
            "confirmed",
            "packed",
            "shipped",
            "delivered",
            "cancelled",
        ];
        if (!id) {
            return reply.code(400).send({
                error: "Order ID is required.",
            });
        }
        if (!allowedStatuses.includes(status)) {
            return reply.code(400).send({
                error: "Invalid order status.",
            });
        }
        const result = await db.query(`
        UPDATE orders
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING
          id,
          order_number,
          status,
          payment_status,
          updated_at
        `, [status, id]);
        if (!result.rows.length) {
            return reply.code(404).send({
                error: "Order not found.",
            });
        }
        return {
            success: true,
            order: result.rows[0],
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to update order status.",
        });
    }
});
app.get("/api/orders/:id", async (request, reply) => {
    try {
        const { id } = request.params;
        if (!id) {
            return reply.code(400).send({
                error: "Order ID is required.",
            });
        }
        const cookies = request.headers.cookie ?? "";
        const match = cookies
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("customer_session="));
        if (!match) {
            return reply.code(401).send({
                error: "Authentication required.",
            });
        }
        const sessionId = match.substring("customer_session=".length);
        const session = await (0, session_service_1.getSession)(sessionId);
        if (!session) {
            return reply.code(401).send({
                error: "Session expired.",
            });
        }
        // --------------------------------
        // ORDER
        // --------------------------------
        const orderResult = await db.query(`
        SELECT
          id,
          order_number,
          invoice_number,
          expected_delivery_date,
          payment_status,
          status,
          total_amount,
          created_at
        FROM orders
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
        `, [id, session.userId]);
        const order = orderResult.rows[0];
        if (!order) {
            return reply.code(404).send({
                error: "Order not found.",
            });
        }
        // --------------------------------
        // ORDER ITEMS
        // --------------------------------
        const itemsResult = await db.query(`
        SELECT
          id,
          product_name,
          variant_name,
          sku,
          quantity,
          unit_price,
          total_price
        FROM order_items
        WHERE order_id = $1
        ORDER BY created_at ASC
        `, [id]);
        return {
            order: {
                id: order.id,
                order_number: order.order_number,
                invoice_number: order.invoice_number,
                expected_delivery_date: order.expected_delivery_date,
                payment_status: order.payment_status,
                status: order.status,
                total_amount: Number(order.total_amount),
                created_at: order.created_at,
                items: itemsResult.rows.map((item) => ({
                    id: item.id,
                    product_name: item.product_name,
                    variant_name: item.variant_name,
                    sku: item.sku,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    total_price: Number(item.total_price),
                })),
            },
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to load order.",
        });
    }
});
app.post("/api/orders", async (request, reply) => {
    const client = await db.connect();
    try {
        const body = request.body;
        const { sessionId, variantId, quantity = 1, couponCode, customerName, customerEmail, customerPhone, location, addressLine1, addressLine2, city, state, postalCode, country = "India", } = body;
        console.log("BACKEND LOCATION:", location);
        const isDirectBuy = Boolean(variantId);
        if (!customerName ||
            !customerEmail ||
            !customerPhone ||
            !addressLine1 ||
            !city ||
            !state ||
            !postalCode) {
            return reply.code(400).send({
                error: "Missing checkout details.",
            });
        }
        if (!isDirectBuy && !sessionId) {
            return reply.code(400).send({
                error: "Cart session is required.",
            });
        }
        // --------------------------------
        // CUSTOMER SESSION
        // --------------------------------
        let customerUserId = null;
        const cookies = request.headers.cookie ?? "";
        const sessionCookie = cookies
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("customer_session="));
        if (!sessionCookie) {
            return reply.code(401).send({
                error: "Google login is required before placing an order.",
            });
        }
        const customerSessionId = sessionCookie.substring("customer_session=".length);
        const session = await (0, session_service_1.getSession)(customerSessionId);
        if (!session || session.role !== "customer") {
            return reply.code(401).send({
                error: "Google login is required before placing an order.",
            });
        }
        customerUserId = session.userId;
        // --------------------------------
        // BUILD ORDER ITEMS
        // --------------------------------
        const items = [];
        if (isDirectBuy) {
            const requestedQuantity = Number(quantity ?? 1);
            if (!Number.isInteger(requestedQuantity) ||
                requestedQuantity < 1) {
                return reply.code(400).send({
                    error: "Quantity must be a whole number of at least 1.",
                });
            }
            const result = await db.query(`
        SELECT
  pv.id,
  pv.sku,
  pv.size,
  pv.color,
  pv.price,
  p.name AS product_name,
  COALESCE(i.quantity, 0) AS inventory_quantity
FROM product_variants pv
JOIN products p
  ON p.id = pv.product_id
LEFT JOIN inventory i
  ON i.variant_id = pv.id
WHERE pv.id = $1
  AND pv.is_active = true
  AND p.is_active = true
LIMIT 1
        `, [variantId]);
            const variant = result.rows[0];
            const availableStock = Number(variant.inventory_quantity ?? 0);
            if (requestedQuantity > availableStock) {
                return reply.code(400).send({
                    error: availableStock <= 0
                        ? "This product is out of stock."
                        : `Only ${availableStock} item${availableStock === 1 ? "" : "s"} available.`,
                });
            }
            const unitPrice = Number(variant.price);
            if (!Number.isFinite(unitPrice) ||
                unitPrice <= 0) {
                return reply.code(400).send({
                    error: "Selected product has an invalid price.",
                });
            }
            items.push({
                variant_id: variant.id,
                product_name: variant.product_name,
                variant_name: [
                    variant.size,
                    variant.color,
                ]
                    .filter(Boolean)
                    .join(" / "),
                sku: variant.sku,
                quantity: requestedQuantity,
                unit_price: unitPrice,
                total_price: unitPrice * requestedQuantity,
            });
        }
        else {
            const cartResult = await db.query(`
        SELECT
          ci.quantity,
          pv.id AS variant_id,
          pv.sku,
          pv.size,
          pv.color,
          pv.price,
          p.name AS product_name
        FROM carts c
        JOIN cart_items ci
          ON ci.cart_id = c.id
        JOIN product_variants pv
          ON pv.id = ci.variant_id
        JOIN products p
          ON p.id = pv.product_id
        WHERE c.session_id = $1
          AND pv.is_active = true
          AND p.is_active = true
        ORDER BY ci.created_at ASC
        `, [sessionId]);
            if (!cartResult.rows.length) {
                return reply.code(404).send({
                    error: "Cart not found or empty.",
                });
            }
            for (const row of cartResult.rows) {
                const unitPrice = Number(row.price);
                const itemQuantity = Number(row.quantity);
                if (!Number.isFinite(unitPrice) ||
                    unitPrice <= 0) {
                    return reply.code(400).send({
                        error: `Invalid variant price for SKU ${row.sku}`,
                    });
                }
                if (!Number.isFinite(itemQuantity) ||
                    itemQuantity <= 0) {
                    return reply.code(400).send({
                        error: `Invalid quantity for SKU ${row.sku}`,
                    });
                }
                items.push({
                    variant_id: row.variant_id,
                    product_name: row.product_name,
                    variant_name: [
                        row.size,
                        row.color,
                    ]
                        .filter(Boolean)
                        .join(" / "),
                    sku: row.sku,
                    quantity: itemQuantity,
                    unit_price: unitPrice,
                    total_price: unitPrice * itemQuantity,
                });
            }
        }
        // --------------------------------
        // TOTALS
        // --------------------------------
        const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
        console.log("ORDER PRICE DEBUG:", {
            items,
            subtotal,
        });
        const shippingFee = 0;
        // --------------------------------
        // COUPON
        // --------------------------------
        let discount = 0;
        let couponId = null;
        if (couponCode &&
            typeof couponCode === "string") {
            const normalizedCode = couponCode.trim().toUpperCase();
            const couponResult = await db.query(`
        SELECT
          id,
          code,
          discount_type,
          discount_value,
          minimum_order_amount,
          usage_limit,
          used_count,
          expires_at,
          is_active
        FROM coupons
        WHERE UPPER(code) = $1
        LIMIT 1
        `, [normalizedCode]);
            const coupon = couponResult.rows[0];
            if (!coupon) {
                return reply.code(400).send({
                    error: "Invalid coupon code.",
                });
            }
            if (!coupon.is_active) {
                return reply.code(400).send({
                    error: "This coupon is inactive.",
                });
            }
            if (coupon.expires_at &&
                new Date(coupon.expires_at).getTime() <= Date.now()) {
                return reply.code(400).send({
                    error: "This coupon has expired.",
                });
            }
            if (coupon.usage_limit != null &&
                Number(coupon.used_count) >=
                    Number(coupon.usage_limit)) {
                return reply.code(400).send({
                    error: "This coupon has reached its usage limit.",
                });
            }
            if (coupon.minimum_order_amount != null &&
                subtotal <
                    Number(coupon.minimum_order_amount)) {
                return reply.code(400).send({
                    error: `Minimum order value is ₹${Number(coupon.minimum_order_amount).toFixed(2)}.`,
                });
            }
            if (coupon.discount_type ===
                "percentage") {
                discount =
                    subtotal *
                        (Number(coupon.discount_value) / 100);
            }
            else if (coupon.discount_type === "fixed") {
                discount = Number(coupon.discount_value);
            }
            discount = Math.min(Math.max(0, discount), subtotal);
            couponId = coupon.id;
        }
        const totalAmount = subtotal +
            shippingFee -
            discount;
        if (totalAmount <= 0) {
            return reply.code(400).send({
                error: "Order total must be greater than zero.",
            });
        }
        // --------------------------------
        // DELIVERY SETTINGS
        // --------------------------------
        const settingsResult = await db.query(`
        SELECT delivery_days
        FROM store_settings
        LIMIT 1
        `);
        const deliveryDays = Math.max(1, Number(settingsResult.rows[0]
            ?.delivery_days ?? 7));
        const expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() +
            deliveryDays);
        const expectedDeliveryDateString = expectedDeliveryDate
            .toISOString()
            .split("T")[0];
        // --------------------------------
        // CREATE ORDER TRANSACTION
        // --------------------------------
        await client.query("BEGIN");
        const orderNumber = `ORD-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase()}`;
        const invoiceNumber = `INV-${Date.now()}`;
        const orderResult = await client.query(`
                INSERT INTO orders (
          user_id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          subtotal,
          discount,
          shipping_fee,
          total_amount,
          status,
          payment_status,
          invoice_number,
          expected_delivery_date,
          latitude,
          longitude,
          location_accuracy,
          location_shared_at
        )
                VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18, $19,
          $20, $21, $22, $23
        )
        RETURNING
          id,
          order_number
        `, [
            customerUserId,
            orderNumber,
            customerName,
            customerEmail
                .trim()
                .toLowerCase(),
            customerPhone,
            addressLine1,
            addressLine2 || null,
            city,
            state,
            postalCode,
            country,
            subtotal,
            discount,
            shippingFee,
            totalAmount,
            "pending",
            "pending",
            invoiceNumber,
            expectedDeliveryDateString,
            location?.latitude ?? null,
            location?.longitude ?? null,
            location?.accuracy ?? null,
            location
                ? new Date()
                : null,
        ]);
        const order = orderResult.rows[0];
        // --------------------------------
        // ORDER ITEMS
        // --------------------------------
        for (const item of items) {
            await client.query(`
        INSERT INTO order_items (
          order_id,
          variant_id,
          product_name,
          variant_name,
          sku,
          quantity,
          unit_price,
          total_price
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8
        )
        `, [
                order.id,
                item.variant_id,
                item.product_name,
                item.variant_name,
                item.sku,
                item.quantity,
                item.unit_price,
                item.total_price,
            ]);
        }
        // --------------------------------
        // CONSUME COUPON
        // --------------------------------
        if (couponId) {
            const couponUpdate = await client.query(`
          UPDATE coupons
          SET used_count = used_count + 1
          WHERE id = $1
            AND (
              usage_limit IS NULL
              OR used_count < usage_limit
            )
          RETURNING id
          `, [couponId]);
            if (!couponUpdate.rows[0]) {
                throw new Error("Coupon could not be applied. Please try again.");
            }
        }
        await client.query("COMMIT");
        return {
            success: true,
            orderId: order.id,
            orderNumber,
            amount: totalAmount,
            subtotal,
            discount,
            invoiceNumber,
            expectedDeliveryDate: expectedDeliveryDateString,
            deliveryDays,
            directBuy: isDirectBuy,
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        app.log.error(error);
        return reply.code(500).send({
            error: error instanceof Error
                ? error.message
                : "Unable to create order.",
        });
    }
    finally {
        client.release();
    }
});
async function getAuthenticatedCustomer(request) {
    const cookieHeader = request.headers.cookie ?? "";
    const match = cookieHeader.match(/(?:^|;\s*)customer_session=([^;]+)/);
    if (!match?.[1]) {
        return null;
    }
    const session = await (0, session_service_1.getSession)(match[1]);
    if (!session) {
        return null;
    }
    if (session.role !== "customer") {
        return null;
    }
    return session;
}
async function settlePaidOrder(client, orderId, razorpayPaymentId) {
    await client.query("BEGIN");
    try {
        const orderResult = await client.query(`
      SELECT
        id,
        payment_status
      FROM orders
      WHERE id = $1
      FOR UPDATE
      `, [orderId]);
        const order = orderResult.rows[0];
        if (!order) {
            throw new Error("Order not found.");
        }
        if (order.payment_status === "paid") {
            await client.query("COMMIT");
            return {
                alreadyProcessed: true,
            };
        }
        const itemsResult = await client.query(`
      SELECT
        variant_id,
        SUM(quantity)::integer AS quantity
      FROM order_items
      WHERE order_id = $1
        AND variant_id IS NOT NULL
      GROUP BY variant_id
      `, [orderId]);
        // Lock and validate inventory.
        for (const item of itemsResult.rows) {
            const inventoryResult = await client.query(`
        SELECT quantity
        FROM inventory
        WHERE variant_id = $1
        FOR UPDATE
        `, [item.variant_id]);
            const inventory = inventoryResult.rows[0];
            if (!inventory) {
                throw new Error(`Inventory record not found for variant ${item.variant_id}.`);
            }
            if (inventory.quantity < item.quantity) {
                throw new Error(`Insufficient inventory for variant ${item.variant_id}.`);
            }
        }
        // Deduct inventory.
        for (const item of itemsResult.rows) {
            await client.query(`
        UPDATE inventory
        SET quantity = quantity - $1
        WHERE variant_id = $2
        `, [
                item.quantity,
                item.variant_id,
            ]);
        }
        // Mark payment as paid.
        await client.query(`
      UPDATE payments
      SET
        provider_payment_id = $1,
        status = 'paid',
        updated_at = NOW()
      WHERE order_id = $2
      `, [
            razorpayPaymentId,
            orderId,
        ]);
        // Mark order as confirmed.
        await client.query(`
      UPDATE orders
      SET
        payment_status = 'paid',
        status = 'confirmed',
        updated_at = NOW()
      WHERE id = $1
      `, [orderId]);
        await client.query("COMMIT");
        return {
            alreadyProcessed: false,
        };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
}
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
app.post("/api/payments/create-order", async (request, reply) => {
    try {
        const body = request.body;
        const { orderId } = body;
        if (!orderId) {
            return reply.code(400).send({
                error: "orderId is required.",
            });
        }
        const customer = await getAuthenticatedCustomer(request);
        if (!customer) {
            return reply.code(401).send({
                error: "Authentication required.",
            });
        }
        const orderResult = await db.query(`
        SELECT
  id,
  order_number,
  total_amount,
  payment_status
FROM orders
WHERE id = $1
  AND user_id = $2
LIMIT 1
        `, [orderId, customer.userId]);
        const order = orderResult.rows[0];
        if (!order) {
            return reply.code(404).send({
                error: "Order not found.",
            });
        }
        if (order.payment_status === "paid") {
            return reply.code(400).send({
                error: "Order is already paid.",
            });
        }
        const amountInPaise = Math.round(Number(order.total_amount) * 100);
        if (!Number.isFinite(amountInPaise) ||
            amountInPaise <= 0) {
            return reply.code(400).send({
                error: "Invalid order amount.",
            });
        }
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: order.order_number,
            notes: {
                order_id: order.id,
                order_number: order.order_number,
            },
        });
        await db.query(`
        INSERT INTO payments (
          order_id,
          provider,
          provider_order_id,
          amount,
          currency,
          status
        )
        VALUES (
          $1,
          'razorpay',
          $2,
          $3,
          'INR',
          'created'
        )
        ON CONFLICT (order_id)
        DO UPDATE SET
          provider_order_id = EXCLUDED.provider_order_id,
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          status = 'created',
          updated_at = NOW()
        `, [
            order.id,
            razorpayOrder.id,
            Number(order.total_amount),
        ]);
        return {
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: "Unable to create Razorpay order.",
        });
    }
});
app.post("/api/payments/verify", async (request, reply) => {
    const client = await db.connect();
    try {
        const customer = await getAuthenticatedCustomer(request);
        if (!customer) {
            return reply.code(401).send({
                error: "Customer authentication required.",
            });
        }
        const body = request.body;
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, } = body;
        if (!orderId ||
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature) {
            return reply.code(400).send({
                error: "Missing payment verification data.",
            });
        }
        const paymentResult = await client.query(`
          SELECT
            p.id,
            p.provider_order_id,
            p.amount,
            p.currency,
            p.order_id,
            p.status,
            o.user_id,
            o.total_amount
          FROM payments p
          JOIN orders o
            ON o.id = p.order_id
          WHERE p.order_id = $1
            AND o.user_id = $2
          LIMIT 1
          `, [
            orderId,
            customer.userId,
        ]);
        const payment = paymentResult.rows[0];
        if (!payment) {
            return reply.code(404).send({
                error: "Payment record not found.",
            });
        }
        const localAmountPaise = Math.round(Number(payment.amount) * 100);
        const orderAmountPaise = Math.round(Number(payment.total_amount) * 100);
        if (!Number.isFinite(localAmountPaise) ||
            !Number.isFinite(orderAmountPaise) ||
            localAmountPaise <= 0 ||
            localAmountPaise !==
                orderAmountPaise) {
            return reply.code(400).send({
                error: "Payment amount mismatch.",
            });
        }
        if (payment.currency !== "INR") {
            return reply.code(400).send({
                error: "Unsupported payment currency.",
            });
        }
        if (payment.provider_order_id !==
            razorpayOrderId) {
            return reply.code(400).send({
                error: "Razorpay order mismatch.",
            });
        }
        const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env
            .RAZORPAY_KEY_SECRET)
            .update(signatureBody)
            .digest("hex");
        if (expectedSignature.length !==
            razorpaySignature.length) {
            return reply.code(400).send({
                error: "Invalid payment signature.",
            });
        }
        const valid = crypto_1.default.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));
        if (!valid) {
            return reply.code(400).send({
                error: "Invalid payment signature.",
            });
        }
        // Verify payment directly with Razorpay.
        const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
        if (!razorpayPayment) {
            return reply.code(400).send({
                error: "Razorpay payment not found.",
            });
        }
        if (razorpayPayment.order_id !==
            razorpayOrderId) {
            return reply.code(400).send({
                error: "Razorpay payment order mismatch.",
            });
        }
        if (razorpayPayment.status !==
            "captured") {
            return reply.code(400).send({
                error: "Razorpay payment is not captured.",
            });
        }
        if (razorpayPayment.currency !==
            "INR") {
            return reply.code(400).send({
                error: "Invalid Razorpay payment currency.",
            });
        }
        const razorpayAmountPaise = Number(razorpayPayment.amount);
        const expectedAmountPaise = Math.round(Number(payment.total_amount) * 100);
        if (!Number.isFinite(razorpayAmountPaise) ||
            razorpayAmountPaise !==
                expectedAmountPaise) {
            return reply.code(400).send({
                error: "Razorpay payment amount mismatch.",
            });
        }
        const settlement = await settlePaidOrder(client, orderId, razorpayPaymentId);
        return {
            success: true,
            verified: true,
            alreadyProcessed: settlement.alreadyProcessed,
        };
    }
    catch (error) {
        request.log.error(error, "Payment verification failed.");
        return reply.code(500).send({
            error: error instanceof Error
                ? error.message
                : "Unable to verify payment.",
        });
    }
    finally {
        client.release();
    }
});
app.post("/api/orders/invoice", async (request, reply) => {
    const client = await db.connect();
    try {
        const body = request.body;
        const { orderId } = body;
        if (!orderId) {
            return reply.code(400).send({
                error: "orderId is required.",
            });
        }
        const cookies = request.headers.cookie ?? "";
        const match = cookies
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("customer_session="));
        if (!match) {
            return reply.code(401).send({
                error: "Authentication required.",
            });
        }
        const sessionId = match.substring("customer_session=".length);
        const session = await (0, session_service_1.getSession)(sessionId);
        if (!session) {
            return reply.code(401).send({
                error: "Session expired.",
            });
        }
        // Get the paid order owned by the authenticated customer.
        const orderResult = await client.query(`
        SELECT
          id,
          order_number,
          invoice_number,
          payment_status
        FROM orders
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
        `, [orderId, session.userId]);
        const order = orderResult.rows[0];
        if (!order) {
            return reply.code(404).send({
                error: "Order not found.",
            });
        }
        // Invoice can only be created for paid orders.
        if (order.payment_status !== "paid") {
            return reply.code(400).send({
                error: "Order is not paid.",
            });
        }
        // Reuse existing invoice if already created.
        const invoiceNumber = order.invoice_number ||
            `INV-${Date.now()}`;
        // Create/reuse invoice.
        const invoiceResult = await client.query(`
        INSERT INTO invoices (
          order_id,
          invoice_number
        )
        VALUES ($1, $2)
        ON CONFLICT (order_id)
        DO UPDATE SET
          invoice_number = invoices.invoice_number
        RETURNING
          id,
          invoice_number
        `, [
            order.id,
            invoiceNumber,
        ]);
        const invoice = invoiceResult.rows[0];
        // Store invoice number on order if missing.
        if (!order.invoice_number) {
            await client.query(`
          UPDATE orders
          SET
            invoice_number = $1,
            updated_at = NOW()
          WHERE id = $2
          `, [
                invoice.invoice_number,
                order.id,
            ]);
        }
        return {
            success: true,
            invoiceNumber: invoice.invoice_number,
            invoiceId: invoice.id,
        };
    }
    catch (error) {
        app.log.error(error);
        return reply.code(500).send({
            error: error instanceof Error
                ? error.message
                : "Unable to create invoice.",
        });
    }
    finally {
        client.release();
    }
});
const port = Number(process.env.PORT ?? 4000);
// Cart
app.get("/api/cart", async (request, reply) => {
    const { sessionId } = request.query;
    if (!sessionId) {
        return reply.code(400).send({
            error: "sessionId is required",
        });
    }
    try {
        const result = await db.query(`
      SELECT
        c.id,
        c.session_id,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ci.id,
              'quantity', ci.quantity,
              'variant_id', ci.variant_id,
              'product_variants',
                json_build_object(
                  'id', pv.id,
                  'sku', pv.sku,
                  'size', pv.size,
                  'color', pv.color,
                  'price', pv.price,
'image_url', pv.image_url,
'inventory_quantity', COALESCE(i.quantity, 0),
'products',
                    json_build_object(
                      'id', p.id,
                      'name', p.name,
                      'slug', p.slug,
                      'main_image_url', p.main_image_url
                    )
                )
            )
          ) FILTER (WHERE ci.id IS NOT NULL),
          '[]'::json
        ) AS cart_items
      FROM carts c
LEFT JOIN cart_items ci ON ci.cart_id = c.id
LEFT JOIN product_variants pv ON pv.id = ci.variant_id
LEFT JOIN products p ON p.id = pv.product_id
LEFT JOIN inventory i ON i.variant_id = pv.id
WHERE c.session_id = $1
GROUP BY c.id
      `, [sessionId]);
        return result.rows[0] ?? null;
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: "Failed to load cart",
        });
    }
});
app.post("/api/cart", async (request, reply) => {
    try {
        const body = request.body;
        const { sessionId, variantId } = body;
        const quantity = Number(body.quantity ?? 1);
        if (!sessionId || !variantId || !Number.isInteger(quantity) || quantity < 1) {
            return reply.code(400).send({
                error: "sessionId, variantId and valid quantity are required",
            });
        }
        const cartResult = await db.query(`
      INSERT INTO carts (session_id)
      VALUES ($1)
      ON CONFLICT (session_id)
      DO UPDATE SET updated_at = now()
      RETURNING id
      `, [sessionId]);
        const cartId = cartResult.rows[0].id;
        await db.query(`
      INSERT INTO cart_items (cart_id, variant_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, variant_id)
      DO UPDATE SET
        quantity = EXCLUDED.quantity,
        created_at = now()
      `, [cartId, variantId, quantity]);
        return { success: true };
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: "Failed to add item",
        });
    }
});
app.delete("/api/cart", async (request, reply) => {
    try {
        const body = request.body;
        if (!body.sessionId) {
            return reply.code(400).send({
                error: "sessionId is required",
            });
        }
        await db.query(`DELETE FROM carts WHERE session_id = $1`, [body.sessionId]);
        return { success: true };
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: "Unable to clear cart",
        });
    }
});
app.delete("/api/cart/item", async (request, reply) => {
    try {
        const body = request.body;
        if (!body.sessionId || !body.itemId) {
            return reply.code(400).send({
                error: "sessionId and itemId are required",
            });
        }
        await db.query(`
      DELETE FROM cart_items
      WHERE id = $1
        AND cart_id = (
          SELECT id
          FROM carts
          WHERE session_id = $2
        )
      `, [body.itemId, body.sessionId]);
        return { success: true };
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: "Unable to remove cart item",
        });
    }
});
// Customer account sync
app.post("/api/account/sync", async (request, reply) => {
    try {
        const body = request.body;
        const userId = body.userId?.trim();
        const email = body.email?.trim().toLowerCase();
        const fullName = body.fullName?.trim() || null;
        if (!userId || !email) {
            return reply.code(400).send({
                error: "userId and email are required.",
            });
        }
        const existingProfile = await db.query(`
      SELECT id, role
      FROM profiles
      WHERE id = $1
      LIMIT 1
      `, [userId]);
        if (existingProfile.rows[0]?.role === "admin") {
            return reply.code(403).send({
                error: "Admin accounts cannot use the customer account area.",
            });
        }
        await db.query(`
      INSERT INTO profiles (
        id,
        full_name,
        email,
        role,
        updated_at
      )
      VALUES ($1, $2, $3, 'customer', now())
      ON CONFLICT (id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = 'customer',
        updated_at = now()
      `, [userId, fullName, email]);
        await db.query(`
      INSERT INTO customer_accounts (
        user_id,
        last_login_at
      )
      VALUES ($1, now())
      ON CONFLICT (user_id)
      DO UPDATE SET
        last_login_at = now()
      `, [userId]);
        await db.query(`
      UPDATE orders
      SET
        user_id = $1,
        updated_at = now()
      WHERE customer_email = $2
        AND user_id IS NULL
      `, [userId, email]);
        return {
            success: true,
            userId,
            email,
        };
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({
            error: "Unable to synchronize customer account.",
        });
    }
});
// Razorpay webhook
app.post("/api/payments/webhook", {
    config: {
        rawBody: true,
    },
}, async (request, reply) => {
    try {
        const webhookSecret = process.env
            .RAZORPAY_WEBHOOK_SECRET
            ?.trim();
        if (!webhookSecret) {
            request.log.warn("Razorpay webhook rejected: secret not configured.");
            return reply.code(503).send({
                error: "Razorpay webhook is not configured.",
            });
        }
        const signature = request.headers["x-razorpay-signature"];
        if (typeof signature !==
            "string" ||
            !signature) {
            return reply.code(400).send({
                error: "Missing Razorpay webhook signature.",
            });
        }
        const rawBody = request.rawBody;
        if (typeof rawBody !== "string" ||
            !rawBody) {
            return reply.code(500).send({
                error: "Webhook verification unavailable.",
            });
        }
        const expectedSignature = crypto_1.default
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");
        const expectedBuffer = Buffer.from(expectedSignature, "utf8");
        const receivedBuffer = Buffer.from(signature, "utf8");
        if (expectedBuffer.length !==
            receivedBuffer.length ||
            !crypto_1.default.timingSafeEqual(expectedBuffer, receivedBuffer)) {
            return reply.code(400).send({
                error: "Invalid webhook signature.",
            });
        }
        const body = request.body;
        if (body.event !==
            "payment.captured") {
            return {
                received: true,
            };
        }
        const payment = body.payload
            ?.payment
            ?.entity;
        if (!payment?.order_id ||
            !payment?.id) {
            return {
                received: true,
            };
        }
        const paymentRecord = await db.query(`
          SELECT
            p.id,
            p.order_id,
            p.amount,
            p.currency,
            p.status,
            o.total_amount
          FROM payments p
          JOIN orders o
            ON o.id = p.order_id
          WHERE p.provider_order_id = $1
          LIMIT 1
          `, [payment.order_id]);
        const record = paymentRecord.rows[0];
        if (!record) {
            return {
                received: true,
            };
        }
        if (payment.currency !== "INR") {
            return reply.code(400).send({
                error: "Unsupported payment currency.",
            });
        }
        if (payment.status !== "captured") {
            return {
                received: true,
            };
        }
        const webhookAmountPaise = Number(payment.amount);
        const expectedAmountPaise = Math.round(Number(record.total_amount) * 100);
        if (!Number.isFinite(webhookAmountPaise) ||
            webhookAmountPaise !==
                expectedAmountPaise) {
            return reply.code(400).send({
                error: "Payment amount mismatch.",
            });
        }
        const client = await db.connect();
        try {
            const settlement = await settlePaidOrder(client, record.order_id, payment.id);
            return {
                received: true,
                alreadyProcessed: settlement.alreadyProcessed,
            };
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        request.log.error(error, "Razorpay webhook processing failed.");
        return reply.code(500).send({
            error: "Webhook processing failed.",
        });
    }
});
app.listen({
    port,
    host: "0.0.0.0",
}).catch((error) => {
    app.log.error(error);
    process.exit(1);
});
