"use client";

// Premium responsive header with menu, search, cart and account shortcuts.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
};

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path
        strokeLinecap="round"
        d="m16 16 4 4"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 8.5h11l.9 11H5.6l.9-11Z"
      />
      <path
        strokeLinecap="round"
        d="M9 9V6.5a3 3 0 0 1 6 0V9"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path
        strokeLinecap="round"
        d="M5.5 19c.8-3.1 3.1-5 6.5-5s5.7 1.9 6.5 5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        d="m6 6 12 12M18 6 6 18"
      />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5 8 12l7 7"
      />
    </svg>
  );
}
export default function StorefrontHeader() {


  const [categories, setCategories] =
    useState<Category[]>([]);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [searchProducts, setSearchProducts] =
    useState<SearchProduct[]>([]);

  const [searchCategories, setSearchCategories] =
    useState<Category[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [headerVisible, setHeaderVisible] =
    useState(true);

  const lastScrollY = useRef(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
  async function loadCategories() {
    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }

      const data = await response.json();

      const categoryMap = new Map<string, Category>();

      for (const product of data.products ?? []) {
        if (product.category) {
          categoryMap.set(
            product.category.id,
            product.category
          );
        }
      }

      const loadedCategories = Array.from(
        categoryMap.values()
      ).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setCategories(loadedCategories);
    } catch (error) {
      console.error(
        "Category loading error:",
        error
      );
      setCategories([]);
    }
  }

  loadCategories();
}, []);

  useEffect(() => {
    function handleScroll() {
      const current =
        window.scrollY;

      if (current <= 20) {
        setHeaderVisible(true);
        lastScrollY.current = current;
        return;
      }

      if (
        current >
        lastScrollY.current + 6
      ) {
        setHeaderVisible(false);
        setMenuOpen(false);
        setSearchOpen(false);
      } else if (
        current <
        lastScrollY.current - 6
      ) {
        setHeaderVisible(true);
      }

      lastScrollY.current = current;
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      setSearchTerm("");
      setSearchProducts([]);
      setSearchCategories([]);
      return;
    }
  }, [searchOpen]);

  useEffect(() => {
  const term = searchTerm.trim();

  if (!searchOpen || term.length < 2) {
    setSearchProducts([]);
    setSearchCategories([]);
    setSearching(false);
    return;
  }

  const timeout = window.setTimeout(async () => {
    setSearching(true);

    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to search products");
      }

      const data = await response.json();
      const products = data.products ?? [];

      const matchedProducts: SearchProduct[] =
        products
          .filter((product: SearchProduct) =>
            product.name
              .toLowerCase()
              .includes(term.toLowerCase())
          )
          .slice(0, 6);

      const categoryMap = new Map<string, Category>();

      products.forEach((product: any) => {
        if (product.category) {
          categoryMap.set(
            product.category.id,
            product.category
          );
        }
      });

      const matchedCategories = Array.from(
        categoryMap.values()
      )
        .filter((category) =>
          category.name
            .toLowerCase()
            .includes(term.toLowerCase())
        )
        .slice(0, 5);

      setSearchProducts(matchedProducts);
      setSearchCategories(matchedCategories);
    } catch (error) {
      console.error("Search error:", error);
      setSearchProducts([]);
      setSearchCategories([]);
    } finally {
      setSearching(false);
    }
  }, 250);

  return () => {
    window.clearTimeout(timeout);
  };
}, [searchTerm, searchOpen]);

  function closeAll() {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b-2 border-[#d6bda8] bg-[#faeadf] transition-transform duration-300 ${
          headerVisible
            ? "translate-y-0"
            : "-translate-y-full"
        }`}
      >
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:h-24 sm:px-8">

          {/* Left icons */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() =>
                setMenuOpen(true)
              }
              className="p-0.5 text-[#4a2925] transition hover:text-[#72263a]"
            >
              <MenuIcon />
            </button>

            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                setSearchOpen(
                  (open) => !open
                );
                setMenuOpen(false);
              }}
              className="p-0.5 text-[#4a2925] transition hover:text-[#72263a]"
            >
              <SearchIcon />
            </button>
          </div>

          {/* Center logo */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src="/images/logo.png"
              alt="Setetha Vastram"
              width={170}
              height={76}
              priority
              className="h-16 w-[145px] object-contain sm:h-20 sm:w-[175px]"
            />
          </Link>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-5">
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative p-0.5 text-[#4a2925] transition hover:text-[#72263a]"
            >
              <BagIcon />
            </Link>

            <Link
              href="/account"
              aria-label="Account"
              className="p-0.5 text-[#4a2925] transition hover:text-[#72263a]"
            >
              <UserIcon />
            </Link>
          </div>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="border-t border-[#e5d7c6] bg-[#fffaf2]">
            <div className="mx-auto max-w-3xl px-5 py-5 sm:px-8">
              <div className="flex items-center gap-3 border-b border-[#cdbba7] pb-3">
                <SearchIcon />

                <input
                  autoFocus
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search products or categories"
                  className="w-full bg-transparent text-base text-[#4a2925] outline-none placeholder:text-[#9a887c]"
                />

                <button
                  type="button"
                  aria-label="Close search"
                  onClick={() =>
                    setSearchOpen(false)
                  }
                  className="text-[#6d574e]"
                >
                  <CloseIcon />
                </button>
              </div>

              {searchTerm.trim().length >=
                2 && (
                <div className="pt-5">
                  {searching ? (
                    <p className="text-sm text-[#765f52]">
                      Searching...
                    </p>
                  ) : (
                    <>
                      {searchProducts.length >
                        0 && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a17b4f]">
                            Products
                          </p>

                          <div className="space-y-1">
                            {searchProducts.map(
                              (
                                product
                              ) => (
                                <Link
                                  key={
                                    product.id
                                  }
                                  href={`/product/${product.slug}`}
                                  onClick={
                                    closeAll
                                  }
                                  className="block rounded-lg px-3 py-3 text-sm text-[#4a2925] hover:bg-[#f5eadc]"
                                >
                                  {
                                    product.name
                                  }
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {searchCategories.length >
                        0 && (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a17b4f]">
                            Categories
                          </p>

                          <div className="space-y-1">
                            {searchCategories.map(
                              (
                                category
                              ) => (
                                <Link
                                  key={
                                    category.id
                                  }
                                  href={`/shop?category=${encodeURIComponent(
                                    category.slug
                                  )}`}
                                  onClick={
                                    closeAll
                                  }
                                  className="block rounded-lg px-3 py-3 text-sm text-[#4a2925] hover:bg-[#f5eadc]"
                                >
                                  {
                                    category.name
                                  }
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {searchProducts.length ===
                        0 &&
                        searchCategories.length ===
                          0 && (
                          <div>
                            <p className="text-sm text-[#765f52]">
                              No exact match found.
                            </p>

                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#a17b4f]">
                              Explore
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <Link
                                href="/shop"
                                onClick={
                                  closeAll
                                }
                                className="rounded-full border border-[#d8c8b7] px-4 py-2 text-sm text-[#4a2925] hover:border-[#72263a] hover:text-[#72263a]"
                              >
                                All Products
                              </Link>

                              {categories
                                .slice(
                                  0,
                                  4
                                )
                                .map(
                                  (
                                    category
                                  ) => (
                                    <Link
                                      key={
                                        category.id
                                      }
                                      href={`/shop?category=${encodeURIComponent(
                                        category.slug
                                      )}`}
                                      onClick={
                                        closeAll
                                      }
                                      className="rounded-full border border-[#d8c8b7] px-4 py-2 text-sm text-[#4a2925] hover:border-[#72263a] hover:text-[#72263a]"
                                    >
                                      {
                                        category.name
                                      }
                                    </Link>
                                  )
                                )}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {pathname !== "/" && (
  <button
    type="button"
    onClick={() => router.back()}
    aria-label="Go back"
    className="fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-full text-[#4a2925] transition hover:bg-black/5"
  >
    <BackIcon />
  </button>
)}
      </header>

      {/* Minimal floating menu icon while header is hidden */}
      {!headerVisible &&
        !menuOpen && (
          <button
            type="button"
            aria-label="Open menu"
            onClick={() =>
              setMenuOpen(true)
            }
            className="fixed right-5 top-5 z-40 p-1 text-[#4a2925]"
          >
            <MenuIcon />
          </button>
        )}

      {/* Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#faeadf]">
          <div className="min-h-full">
            <div className="flex h-20 items-center justify-between border-b border-[#d8c1a9] px-5 sm:h-24 sm:px-8">
              <Link
                href="/"
                onClick={closeAll}
                className="text-sm font-semibold tracking-[0.16em] text-[#72263a]"
              >
                SETETHA VASTRAM
              </Link>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="p-1 text-[#4a2925]"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="mx-auto flex max-w-2xl flex-col px-6 py-7">
              <Link
                href="/"
                onClick={closeAll}
                className="border-b border-[#e5d7c6] py-4 text-lg text-[#4a2925]"
              >
                Home
              </Link>

              <Link
                href="/shop"
                onClick={closeAll}
                className="border-b border-[#e5d7c6] py-4 text-lg text-[#4a2925]"
              >
                Shop All
              </Link>
              <button
  type="button"
  onClick={() => {
    closeAll();
    window.location.href = "/shop?filter=open";
  }}
  className="border-b border-[#e5d7c6] py-4 text-left text-lg text-[#4a2925]"
>
  Filter
</button>
              <div className="border-b border-[#e5d7c6] py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#a17b4f]">
                  Categories
                </p>

                <div className="flex flex-col gap-2">
                  {categories.map(
                    (category) => (
                      <Link
                        key={
                          category.id
                        }
                        href={`/shop?category=${encodeURIComponent(
                          category.slug
                        )}`}
                        onClick={
                          closeAll
                        }
                        className="py-1 text-base text-[#4a2925]"
                      >
                        {category.name}
                      </Link>
                    )
                  )}

                  {categories.length ===
                    0 && (
                    <p className="text-sm text-[#765f52]">
                      No categories available.
                    </p>
                  )}
                </div>
              </div>

              <Link
                href="/#new-arrivals"
                onClick={closeAll}
                className="border-b border-[#e5d7c6] py-4 text-lg text-[#4a2925]"
              >
                New Arrivals
              </Link>

              <Link
                href="/#special-offers"
                onClick={closeAll}
                className="border-b border-[#e5d7c6] py-4 text-lg text-[#4a2925]"
              >
                Special Offers
              </Link>

              <Link
                href="/#biggest-savings"
                onClick={closeAll}
                className="border-b border-[#e5d7c6] py-4 text-lg text-[#4a2925]"
              >
                Biggest Savings
              </Link>

              <Link
                href="/#more-to-explore"
                onClick={closeAll}
                className="border-b border-[#e5d7c6] py-4 text-lg text-[#4a2925]"
              >
                More to Explore
              </Link>

              <Link
                href="/cart"
                onClick={closeAll}
                className="border-b border-[#e5d7c6] py-4 text-lg text-[#4a2925]"
              >
                Cart
              </Link>

              <Link
                href="/account"
                onClick={closeAll}
                className="border-b border-[#e5d7c6] py-4 text-lg text-[#4a2925]"
              >
                Account
              </Link>

              <Link
                href="/account"
                onClick={closeAll}
                className="py-4 text-lg text-[#4a2925]"
              >
                My Orders
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}