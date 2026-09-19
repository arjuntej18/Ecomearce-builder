"use client";

// Homepage with dynamic category strips and independent horizontal product shelves.
import {
  MessageCircle as WhatsAppIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";


type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type ProductVariant = {
  price: number | null;
  original_price: number | null;
  discount_percent: number | null;
  is_active: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  category_id: string | null;
  created_at: string;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductCardProps = {
  product: Product;
};

function ProductCard({
  product,
}: ProductCardProps) {

  const [imageIndex, setImageIndex] =
    useState(0);

  const galleryImages =
    product.product_images
      ?.slice()
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order
      ) ?? [];

  const imageUrls =
    galleryImages.length > 0
      ? galleryImages.map(
          (image) => image.image_url
        )
      : product.main_image_url
        ? [product.main_image_url]
        : [];

  const activeVariants =
    product.product_variants?.filter(
      (variant) => variant.is_active
    ) ?? [];

  const validVariants =
    activeVariants.filter(
      (variant) =>
        Number.isFinite(
          Number(variant.price)
        ) &&
        Number(variant.price) > 0
    );

  const lowestVariant =
    validVariants.length > 0
      ? validVariants.reduce(
          (lowest, current) =>
            Number(current.price) <
            Number(lowest.price)
              ? current
              : lowest
        )
      : null;

  const currentPrice =
    lowestVariant
      ? Number(lowestVariant.price)
      : null;

  const originalPrice =
    lowestVariant?.original_price != null
      ? Number(
          lowestVariant.original_price
        )
      : null;

  const discountPercent =
    lowestVariant?.discount_percent != null
      ? Number(
          lowestVariant.discount_percent
        )
      : 0;

  const hasDiscount =
    originalPrice !== null &&
    currentPrice !== null &&
    originalPrice > currentPrice &&
    discountPercent > 0;

  function handleMouseMove(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (imageUrls.length <= 1) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const zoneWidth =
      rect.width / imageUrls.length;

    const nextIndex = Math.min(
      imageUrls.length - 1,
      Math.floor(x / zoneWidth)
    );

    setImageIndex(nextIndex);
  }

  function handleTouchEnd() {
    if (imageUrls.length <= 1) {
      return;
    }

    setImageIndex(
      (current) =>
        current >= imageUrls.length - 1
          ? 0
          : current + 1
    );
  }

  

  return (
    <Link
  href={`/product/${product.slug}`}
      className="group block w-[220px] min-w-[220px] overflow-hidden rounded-xl border border-[#e4d8ca] bg-[#fffaf2] transition duration-300 hover:-translate-y-0.5 hover:border-[#b59670] hover:shadow-lg sm:w-[240px] sm:min-w-[240px]"
    >
      <div
        className="relative overflow-hidden bg-[#eee3d4] touch-pan-y"
        onMouseMove={handleMouseMove}
        onTouchEnd={handleTouchEnd}
      >
        {imageUrls.length > 0 ? (
          <img
            src={imageUrls[imageIndex]}
            alt={product.name}
            draggable={false}
            className="aspect-square w-full select-none object-cover transition-all duration-500 ease-out group-hover:scale-[1.015]"
            style={{
              viewTransitionName:
                `product-image-${product.id}`,
            }}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-[#8b776a]">
            No image
          </div>
        )}

        {imageUrls.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-sm">
            {imageUrls.map(
              (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === imageIndex
                      ? "bg-white"
                      : "bg-white/45"
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-medium text-[#422622]">
          {product.name}
        </h3>

        {hasDiscount ? (
          <div className="mt-2 flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-[#9a8b82] line-through">
              ₹
              {originalPrice!.toFixed(2)}
            </span>

            <span className="text-sm font-semibold text-[#9b7548]">
              {discountPercent}% OFF
            </span>

            <span className="text-lg font-bold text-[#72263a]">
              ₹
              {currentPrice!.toFixed(2)}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-lg font-bold text-[#72263a]">
            {currentPrice !== null
              ? `₹${currentPrice.toFixed(2)}`
              : "Price unavailable"}
          </p>
        )}
      </div>
    </Link>
  );
}

function CategoryStrip({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-center gap-7 overflow-x-auto py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-9">
          <Link
            href="/shop"
            className="group relative shrink-0 py-1 text-sm font-semibold text-[#701c30] transition-colors duration-300"
          >
            All
            <span className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-[#701c30]" />
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(
                category.slug
              )}`}
              className="group relative shrink-0 py-1 text-sm font-medium text-[#4a2925]/80 transition-colors duration-300 hover:text-[#701c30]"
            >
              {category.name}

              <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-[#701c30] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function ProductShelf({
  id,
  title,
  products,
}: {
  id: string;
  title: string;
  products: Product[];
}) {
  if (
    products.length === 0
  ) {
    return null;
  }

  return (
    <section
      id={id}
      className="mb-14"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a17b4f]">
            Collection
          </p>

          <h2 className="text-2xl font-semibold text-[#4a2925] sm:text-3xl">
            {title}
          </h2>
        </div>

        <Link
          href="/shop"
          className="shrink-0 text-sm font-semibold text-[#72263a] hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 sm:gap-5">
        {products.map(
          (product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          )
        )}
      </div>
    </section>
  );
}
function PixelHero({
  images,
}: {
  images: string[];
}) {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [transitioning, setTransitioning] =
    useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next =
        (active + 1) % images.length;

      setPrevious(active);
      setActive(next);
      setTransitioning(true);

      const finish = setTimeout(() => {
        setPrevious(null);
        setTransitioning(false);
      }, 250);

      return () => clearTimeout(finish);
    }, 4000);

    return () => clearTimeout(timer);
  }, [active, images.length]);

  return (
    <div className="relative h-[520px] overflow-hidden sm:h-[620px]">
      {/* Previous image */}
      {previous !== null && (
        <img
          src={images[previous]}
          alt="Seetha Vastram"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* New image */}
      <img
        src={images[active]}
        alt="Seetha Vastram"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-out ${
          transitioning
            ? "opacity-100"
            : "opacity-100"
        }`}
        style={{
          opacity: transitioning ? 1 : 1,
        }}
      />

      {/* Soft micro-level transition layer */}
      <div
        className={`absolute inset-0 bg-white/5 backdrop-blur-[0.2px] transition-opacity duration-[250ms] ${
          transitioning
            ? "opacity-0"
            : "opacity-0"
        }`}
      />
    </div>
  );
}

export default function HomePage() {
  const supabase =
    createSupabaseBrowserClient();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadHomepage() {
      setLoading(true);

      const [
        productsResult,
        categoriesResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select(
            `
            id,
            name,
            slug,
            main_image_url,
            category_id,
            created_at,
            product_images (
              id,
              image_url,
              sort_order
            ),
            product_variants (
              price,
              original_price,
              discount_percent,
              is_active
            )
          `
          )
          .eq(
            "is_active",
            true
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),

        supabase
          .from("categories")
          .select(
            "id, name, slug"
          )
          .order(
            "name",
            {
              ascending: true,
            }
          ),
      ]);

      if (
        productsResult.error
      ) {
        console.error(
          productsResult.error
        );
        setProducts([]);
      } else {
        setProducts(
          (productsResult.data ??
            []) as Product[]
        );
      }

      if (
        categoriesResult.error
      ) {
        console.error(
          categoriesResult.error
        );
        setCategories([]);
      } else {
        setCategories(
          categoriesResult.data ??
            []
        );
      }

      setLoading(false);
    }

    loadHomepage();
  }, []);

  useEffect(() => {
  const items = Array.from(
    document.querySelectorAll<HTMLElement>("[data-hero-item]")
  );
  console.log("Hero items found:", items.length);
  if (items.length === 0) return;

  const handleScroll = () => {
    const scrollY = window.scrollY;

    items.forEach((item, index) => {
      const start = index * 45;
      const progress = Math.min(
        Math.max((scrollY - start) / 140, 0),
        1
      );

      item.style.opacity = `${1 - progress}`;
      item.style.transform = `translateY(${-25 * progress}px)`;
      item.style.filter = `blur(${7 * progress}px)`;
    });
  };

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
  /*
    Each shelf has independent logic.

    A product is allowed to appear in multiple
    shelves when it genuinely qualifies.
  */

  const newArrivals =
    products.slice(0, 8);

  const specialOffers =
    products
      .filter((product) =>
        product.product_variants?.some(
          (variant) =>
            variant.is_active &&
            Number(
              variant.discount_percent ??
                0
            ) > 0
        )
      )
      .slice(0, 8);

  const biggestSavings =
    products
      .map((product) => {
        const discounts =
          product.product_variants
            ?.filter(
              (variant) =>
                variant.is_active &&
                Number(
                  variant.discount_percent ??
                    0
                ) > 0
            )
            .map(
              (variant) =>
                Number(
                  variant.discount_percent ??
                    0
                )
            ) ?? [];

        return {
          product,
          discount:
            discounts.length >
            0
              ? Math.max(
                  ...discounts
                )
              : 0,
        };
      })
      .filter(
        (item) =>
          item.discount > 0
      )
      .sort(
        (a, b) =>
          b.discount -
          a.discount
      )
      .slice(0, 8)
      .map(
        (item) =>
          item.product
      );

  const moreToExplore =
    products.slice(0, 12);

  return (
    <main className="min-h-screen  text-[#4a2925] pt-20 sm:pt-24">

      {/* First category strip */}
      <CategoryStrip
        categories={categories}
      
      />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

       {/* Hero */}
{/* Hero */}
<section className="relative mb-16 overflow-hidden">
  <div className="relative">
    <PixelHero
      images={[
        "/images/hero-1.jpg",
        "/images/hero-2.jpg",
        "/images/hero-3.jpg",
        "/images/hero-4.jpg",
      ]}
    />

    <div className="absolute inset-0 bg-black/20" />

    <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
      <div className="max-w-3xl text-white">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em]">
          Seetha Vastram
        </p>

        <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
          Timeless style,
          <br />
          thoughtfully chosen.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
          Discover our latest collections, selected pieces and special offers.
        </p>
      </div>
    </div>
  </div>
</section>

        {loading ? (
          <div className="py-20 text-center text-[#765f52]">
            Loading products...
          </div>
        ) : products.length ===
          0 ? (
          <div className="rounded-xl border border-[#e5d7c6] bg-[#fffaf2] p-12 text-center text-[#765f52]">
            No products available
            yet.
          </div>
        ) : (
          <>
            {/* New arrivals */}
            <ProductShelf
              id="new-arrivals"
              title="New Arrivals"
              products={
                newArrivals
              }
            />

            
            

            {/* Special offers */}
            <ProductShelf
              id="special-offers"
              title="Special Offers"
              products={
                specialOffers
              }
            />

            {/* Biggest savings */}
            <ProductShelf
              id="biggest-savings"
              title="Biggest Savings"
              products={
                biggestSavings
              }
            />

{/* More to explore */}
<ProductShelf
  id="more-to-explore"
  title="More to Explore"
  products={moreToExplore}
/>

{/* Shop */}
<section
  id="shop"
  className="mb-14 border-y border-[#d6bda8] py-10 text-center"
>
  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a17b4f]">
    The Collection
  </p>

  <h2 className="mt-2 font-serif text-3xl text-[#4a2925] sm:text-4xl">
    Shop
  </h2>

  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6d574e]">
    Explore the complete Seetha Vastram collection.
  </p>

  <Link
    href="/shop"
    className="mt-6 inline-flex rounded-full border border-[#72263a] bg-[#72263a] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#5d1e2f]"
  >
    Go to Shop
  </Link>
</section>

        {/* Footer */}
        <footer className="-mx-5 border-t border-[#d8c1a9] bg-[#faeadf] px-5 pt-10 pb-8 sm:-mx-8 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <h3 className="font-serif text-xl text-[#4a2925]">
                Seetha Vastram
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[#765f52]">
                Rooted in tradition.
                Woven for you.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#a17b4f]">
                Store
              </h4>

              <div className="mt-3 space-y-2 text-sm text-[#765f52]">
                <Link
                  href="/shop"
                  className="block hover:text-[#72263a]"
                >
                  Shop
                </Link>

                <Link
                  href="/account"
                  className="block hover:text-[#72263a]"
                >
                  Account
                </Link>

                <Link
                  href="/cart"
                  className="block hover:text-[#72263a]"
                >
                  Cart
                </Link>
              </div>
            </div>

            <div>
  <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#a17b4f]">
    Connect
  </h4>

  <div className="mt-4 flex items-center gap-4">
    <a
      href="https://www.instagram.com/seetha_vastram?stkn=NWpnYXFyMnIyazZx"
      target="_blank"
      rel="noreferrer"
      aria-label="Instagram"
      className="text-[#4a2925] transition-opacity hover:opacity-60"
    >
      <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.7"
  className="h-[19px] w-[19px]"
  aria-hidden="true"
>
  <rect
    x="3"
    y="3"
    width="18"
    height="18"
    rx="5"
  />
  <circle
    cx="12"
    cy="12"
    r="4"
  />
  <circle
    cx="17.5"
    cy="6.5"
    r="1"
    fill="currentColor"
    stroke="none"
  />
</svg>
    </a>

    <a
      href="https://wa.me/919527822498"
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="text-[#4a2925] transition-opacity hover:opacity-60"
    >
      <WhatsAppIcon size={19} strokeWidth={1.7} />
    </a>

    <a
      href="tel:+919527822498"
      aria-label="Call Seetha Vastram"
      className="text-[#4a2925] transition-opacity hover:opacity-60"
    >
      <PhoneIcon size={19} strokeWidth={1.7} />
    </a>

    <a
      href="mailto:seethavastram@gmail.com"
      aria-label="Email Seetha Vastram"
      className="text-[#4a2925] transition-opacity hover:opacity-60"
    >
      <MailIcon size={19} strokeWidth={1.7} />
    </a>
  </div>
</div>
          </div>

          <div className="mt-8 border-t border-[#e2d4c5] pt-5 text-xs text-[#8b776a]">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Seetha Vastram. All
            rights reserved.
          </div>
        </footer>
          </>
        )}
      </div>
    </main>
  );
} 
