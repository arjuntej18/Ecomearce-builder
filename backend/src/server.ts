import Fastify from "fastify";
import { Pool } from "pg";
import Redis from "ioredis";
import { Queue } from "bullmq";

const app = Fastify({
  logger: true,
});

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redis = new Redis(
  process.env.REDIS_URL ?? "redis://redis:6379"
);

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
const backgroundQueue = new Queue(
  "background",
  {
    connection: redis,
  }
);

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

app.get("/api/products", async (request) => {
  const { category } = request.query as {
    category?: string;
  };

  const params: string[] = [];

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

  const result = await db.query(
    `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.main_image_url,
      p.category_id,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
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
      ) AS product_images

    FROM products p

    WHERE p.is_active = true
    ${categoryFilter}

    ORDER BY p.created_at DESC
    `,
    params
  );

  return {
    products: result.rows,
  };
});

app.get("/api/products/:slug", async (request, reply) => {
  const { slug } = request.params as {
    slug: string;
  };

  const productResult = await db.query(
    `
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
    `,
    [slug]
  );

  const product = productResult.rows[0];

  if (!product) {
    return reply.code(404).send({
      error: "Product not found.",
    });
  }

  const variantsResult = await db.query(
    `
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
    `,
    [product.id]
  );

  const inventoryResult = await db.query(
    `
    SELECT
      variant_id,
      quantity
    FROM inventory
    WHERE variant_id = ANY($1::uuid[])
    `,
    [
      variantsResult.rows.map(
        (variant) => variant.id
      ),
    ]
  );

  return {
    product,
    variants: variantsResult.rows,
    inventory: inventoryResult.rows,
  };
});


app.post("/dev/test-job", async () => {
  const job = await backgroundQueue.add(
    "test",
    {
      message: "Queue connection works",
      createdAt: new Date().toISOString(),
    }
  );

  return {
    status: "queued",
    jobId: job.id,
  };
});
const port = Number(process.env.PORT ?? 4000);

app.listen({
  port,
  host: "0.0.0.0",
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});